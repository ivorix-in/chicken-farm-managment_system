import { AppError } from "../../core/errors/AppError.js";
import { logAction } from "../../core/audit/auditLog.service.js";
import { updateFarmRecord } from "../farms/farms.repository.js";
import { BatchFilters, countActiveBatches, createBatchRecord, findActiveBatchForFarm, findBatchById, findBatches, sumActiveBirds, updateBatchRecord } from "./batches.repository.js";
import { sumFeedUsedForBatch } from "../feed/feed.service.js";
import { findLastVisitForBatch } from "../dailyVisits/dailyVisits.service.js";

export interface CreateBatchInput {
  farmId: string;
  batchNo: string;
  chickCount: number;
  placementDate: string;
  expectedClosureDate?: string;
  notes?: string;
  chickPurchase?: {
    supplierId?: string | null;
    pricePerChick: number;
    totalAmount: number;
    purchasedAt: string;
    vendor?: string;
    breed?: string;
  } | null;
}

export async function listBatches(filters: BatchFilters, page: number, limit: number) {
  const { rows, total } = await findBatches(filters, page, limit);
  return {
    batches: rows.map((r) => r.toObject()),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getBatch(id: string) {
  const batch = await findBatchById(id);
  if (!batch) throw new AppError(404, "Batch not found");
  const obj = batch.toObject() as unknown as Record<string, unknown>;
  // Compute current age in days
  const placed = batch.placementDate;
  const diffMs = Date.now() - placed.getTime();
  obj.currentAgeDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return obj;
}

export async function createBatch(input: CreateBatchInput, actorId: string, ip?: string) {
  // Enforce one active batch per farm
  const existing = await findActiveBatchForFarm(input.farmId);
  if (existing) throw new AppError(409, `Farm already has an active batch (${existing.batchNo})`);

  const batch = await createBatchRecord({
    batchNo: input.batchNo.trim(),
    farmId: input.farmId,
    chickCount: input.chickCount,
    currentBirdCount: input.chickCount,
    totalMortality: 0,
    placementDate: new Date(input.placementDate),
    expectedClosureDate: input.expectedClosureDate ? new Date(input.expectedClosureDate) : null,
    status: "PLACED",
    notes: input.notes?.trim() ?? null,
    createdBy: actorId,
    closedAt: null,
    chickPurchase: input.chickPurchase
      ? {
          supplierId: input.chickPurchase.supplierId ?? null,
          pricePerChick: input.chickPurchase.pricePerChick,
          totalAmount: input.chickPurchase.totalAmount,
          purchasedAt: new Date(input.chickPurchase.purchasedAt),
          vendor: input.chickPurchase.vendor ?? null,
          breed: input.chickPurchase.breed ?? null,
        }
      : null,
  });

  // Link batch to farm
  await updateFarmRecord(input.farmId, { currentBatchId: batch.id, status: "ACTIVE" } as any);

  logAction({ userId: actorId, action: "create", entity: "Batch", entityId: batch.id, ip });
  return batch.toObject();
}

export async function updateBatch(id: string, input: Partial<{ status: "PLACED" | "ACTIVE" | "COLLECTION"; notes: string | null; expectedClosureDate: string }>, actorId: string, ip?: string) {
  const existing = await findBatchById(id);
  if (!existing) throw new AppError(404, "Batch not found");
  if (existing.status === "CLOSED") throw new AppError(400, "Cannot update a closed batch");

  const updated = await updateBatchRecord(id, {
    ...(input.status && { status: input.status }),
    ...(input.notes !== undefined && { notes: input.notes }),
    ...(input.expectedClosureDate && { expectedClosureDate: new Date(input.expectedClosureDate) }),
  });

  logAction({ userId: actorId, action: "update", entity: "Batch", entityId: id, changes: input as Record<string, unknown>, ip });
  return updated!.toObject();
}

export async function closeBatch(id: string, actorId: string, ip?: string) {
  const batch = await findBatchById(id);
  if (!batch) throw new AppError(404, "Batch not found");
  if (batch.status === "CLOSED") throw new AppError(400, "Batch is already closed");

  await updateBatchRecord(id, { status: "CLOSED", closedAt: new Date() });
  // Clear farm's current batch reference
  await updateFarmRecord(batch.farmId as string, { currentBatchId: null, status: "INACTIVE" } as any);

  logAction({ userId: actorId, action: "close", entity: "Batch", entityId: id, ip });
  return { message: "Batch closed successfully" };
}

export async function getBatchSummary(id: string) {
  const batch = await findBatchById(id);
  if (!batch) throw new AppError(404, "Batch not found");

  const [lastVisit, totalFeedUsed] = await Promise.all([
    findLastVisitForBatch(id),
    sumFeedUsedForBatch(id),
  ]);

  const placed = batch.placementDate;
  const diffMs = Date.now() - placed.getTime();
  const currentAgeDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return {
    batchId: batch.id,
    batchNo: batch.batchNo,
    status: batch.status,
    chickCount: batch.chickCount,
    currentBirdCount: batch.currentBirdCount,
    totalMortality: batch.totalMortality,
    currentAgeDays,
    averageWeightKg: lastVisit?.approxWeightKg ?? 0,
    totalFeedUsedKg: totalFeedUsed,
    lastVisitDate: lastVisit?.visitDate ?? null,
  };
}

export { countActiveBatches, sumActiveBirds };
