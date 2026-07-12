import { AppError } from "../../core/errors/AppError.js";
import { logAction } from "../../core/audit/auditLog.service.js";
import { findBatchById, updateBatchRecord } from "../batches/batches.repository.js";
import { findFarmById } from "../farms/farms.repository.js";
import { findVehicleById } from "../vehicles/vehicles.repository.js";
import { ICollectionReportItem } from "./models/index.js";
import {
  CollectionReportFilters,
  createCollectionReportRecord,
  deleteCollectionReportRecord,
  findCollectionReportById,
  findCollectionReports,
  updateCollectionReportRecord,
} from "./collectionReports.repository.js";

function calculateTotals(items: ICollectionReportItem[]) {
  const boxNumbers = new Set<number>();
  let totalChickens = 0;
  let totalEmptyWeight = 0;
  let totalLoadedWeight = 0;
  let totalChickenWeight = 0;

  for (const item of items) {
    if (boxNumbers.has(item.boxNumber)) {
      throw new AppError(400, `Duplicate box number: ${item.boxNumber}`);
    }
    boxNumbers.add(item.boxNumber);

    if (item.emptyWeight <= 0) {
      throw new AppError(400, "Empty weight must be greater than zero");
    }
    if (item.loadedWeight <= item.emptyWeight) {
      throw new AppError(400, "Loaded weight must be greater than empty weight");
    }
    if (item.chickenCount <= 0) {
      throw new AppError(400, "Chicken count must be greater than zero");
    }

    const chickenWeight = Number((item.loadedWeight - item.emptyWeight).toFixed(2));
    item.chickenWeight = chickenWeight;

    totalChickens += item.chickenCount;
    totalEmptyWeight += item.emptyWeight;
    totalLoadedWeight += item.loadedWeight;
    totalChickenWeight += chickenWeight;
  }

  totalEmptyWeight = Number(totalEmptyWeight.toFixed(2));
  totalLoadedWeight = Number(totalLoadedWeight.toFixed(2));
  totalChickenWeight = Number(totalChickenWeight.toFixed(2));

  const averageChickenWeight = totalChickens > 0 
    ? Number((totalChickenWeight / totalChickens).toFixed(3)) 
    : 0;

  return {
    totalBoxes: items.length,
    totalChickens,
    totalEmptyWeight,
    totalLoadedWeight,
    totalChickenWeight,
    averageChickenWeight,
  };
}

export async function listCollectionReports(filters: CollectionReportFilters, page = 1, limit = 20) {
  const { rows, total } = await findCollectionReports(filters, page, limit);
  return {
    collectionReports: rows.map((r) => r.toObject()),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getCollectionReport(id: string) {
  const report = await findCollectionReportById(id);
  if (!report) throw new AppError(404, "Collection report not found");
  return report.toObject();
}

export async function createCollectionReport(
  input: {
    vehicleId: string;
    farmId: string;
    batchId: string;
    collectionDate: string;
    driverName?: string | null;
    remarks?: string | null;
    items: ICollectionReportItem[];
  },
  actorId: string,
  ip?: string
) {
  const vehicle = await findVehicleById(input.vehicleId);
  if (!vehicle) throw new AppError(404, "Vehicle not found");

  const farm = await findFarmById(input.farmId);
  if (!farm) throw new AppError(404, "Farm not found");

  const batch = await findBatchById(input.batchId);
  if (!batch) throw new AppError(404, "Batch not found");
  if (batch.farmId !== input.farmId) {
    throw new AppError(400, "Selected batch does not belong to this farm");
  }
  if (batch.status === "CLOSED") {
    throw new AppError(400, "Cannot create a collection report for a closed batch");
  }

  const totals = calculateTotals(input.items);

  const report = await createCollectionReportRecord({
    vehicleId: input.vehicleId,
    farmId: input.farmId,
    batchId: input.batchId,
    collectionDate: new Date(input.collectionDate),
    driverName: input.driverName?.trim() ?? null,
    remarks: input.remarks?.trim() ?? null,
    status: "DRAFT",
    createdBy: actorId,
    items: input.items,
    ...totals,
  });

  logAction({ userId: actorId, action: "create", entity: "CollectionReport", entityId: report.id, ip });
  return report.toObject();
}

export async function updateCollectionReport(
  id: string,
  input: Partial<{
    vehicleId: string;
    collectionDate: string;
    driverName: string | null;
    remarks: string | null;
    items: ICollectionReportItem[];
  }>,
  actorId: string,
  ip?: string
) {
  const existing = await findCollectionReportById(id);
  if (!existing) throw new AppError(404, "Collection report not found");
  if (existing.status === "SUBMITTED") {
    throw new AppError(400, "Cannot update a finalized collection report");
  }

  if (input.vehicleId) {
    const vehicle = await findVehicleById(input.vehicleId);
    if (!vehicle) throw new AppError(404, "Vehicle not found");
  }

  let totals = {};
  if (input.items) {
    totals = calculateTotals(input.items);
  }

  const updated = await updateCollectionReportRecord(id, {
    ...(input.vehicleId && { vehicleId: input.vehicleId }),
    ...(input.collectionDate && { collectionDate: new Date(input.collectionDate) }),
    ...(input.driverName !== undefined && { driverName: input.driverName }),
    ...(input.remarks !== undefined && { remarks: input.remarks }),
    ...(input.items && { items: input.items }),
    ...totals,
  });

  logAction({ userId: actorId, action: "update", entity: "CollectionReport", entityId: id, changes: input as Record<string, unknown>, ip });
  return updated!.toObject();
}

export async function submitCollectionReport(id: string, actorId: string, ip?: string) {
  const report = await findCollectionReportById(id);
  if (!report) throw new AppError(404, "Collection report not found");
  if (report.status === "SUBMITTED") {
    throw new AppError(400, "Collection report is already finalized");
  }

  const updated = await updateCollectionReportRecord(id, { status: "SUBMITTED" } as any);

  const batch = await findBatchById(report.batchId);
  if (batch) {
    const newSoldBirds = batch.soldBirds + report.totalChickens;
    const newTotalKgsSold = Number((batch.totalKgsSold + report.totalChickenWeight).toFixed(2));
    const newCurrentBirdCount = Math.max(0, batch.currentBirdCount - report.totalChickens);
    const newStatus = newCurrentBirdCount === 0 ? "COMPLETED" : batch.status;

    await updateBatchRecord(report.batchId, {
      soldBirds: newSoldBirds,
      totalKgsSold: newTotalKgsSold,
      currentBirdCount: newCurrentBirdCount,
      status: newStatus,
    });
  }

  logAction({ userId: actorId, action: "submit", entity: "CollectionReport", entityId: id, ip });
  return updated!.toObject();
}

export async function deleteCollectionReport(id: string, actorId: string, ip?: string) {
  const existing = await findCollectionReportById(id);
  if (!existing) throw new AppError(404, "Collection report not found");
  if (existing.status === "SUBMITTED") {
    throw new AppError(400, "Cannot delete a finalized collection report");
  }

  await deleteCollectionReportRecord(id);
  logAction({ userId: actorId, action: "delete", entity: "CollectionReport", entityId: id, ip });
}
