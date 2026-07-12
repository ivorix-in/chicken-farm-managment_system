import { AppError } from "../../core/errors/AppError.js";
import { logAction } from "../../core/audit/auditLog.service.js";
import { findBatchById, updateBatchRecord } from "../batches/batches.repository.js";
import {
  VisitFilters,
  countTodaysVisits,
  createVisitRecord,
  findLastVisitForBatch,
  findVisitByBatchAndDate,
  findVisitById,
  findVisits,
} from "./dailyVisits.repository.js";

export interface CreateVisitInput {
  batchId: string;
  visitDate: string;
  mortalityToday: number;
  approxWeightKg: number;
  feedUsedKg: number;
  remarks?: string;
  notifyDoctor?: boolean;
}

function normalizeDate(dateStr: string): Date {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function listVisits(filters: VisitFilters, page: number, limit: number) {
  const { rows, total } = await findVisits(filters, page, limit);
  return { visits: rows.map((r) => r.toObject()), total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getVisit(id: string) {
  const visit = await findVisitById(id);
  if (!visit) throw new AppError(404, "Visit not found");
  return visit.toObject();
}

export async function createVisit(input: CreateVisitInput, supervisorId: string, ip?: string) {
  const batch = await findBatchById(input.batchId);
  if (!batch) throw new AppError(404, "Batch not found");
  if (batch.status === "CLOSED") throw new AppError(400, "Cannot record a visit for a closed batch");

  const visitDate = normalizeDate(input.visitDate);

  // Enforce one visit per batch per day
  const duplicate = await findVisitByBatchAndDate(input.batchId, visitDate);
  if (duplicate) throw new AppError(409, "A visit for this batch on this date already exists");

  // Get running totals from last visit
  const lastVisit = await findLastVisitForBatch(input.batchId);
  const previousMortality = lastVisit?.mortalityTotal ?? 0;
  const previousBirdCount = lastVisit?.birdCount ?? batch.chickCount;

  if (input.mortalityToday > previousBirdCount) {
    throw new AppError(400, "Mortality today cannot exceed current bird count");
  }

  const mortalityTotal = previousMortality + input.mortalityToday;
  const birdCount = previousBirdCount - input.mortalityToday;

  const visit = await createVisitRecord({
    batchId: input.batchId,
    supervisorId,
    visitDate,
    mortalityToday: input.mortalityToday,
    mortalityTotal,
    birdCount,
    approxWeightKg: input.approxWeightKg,
    feedUsedKg: input.feedUsedKg,
    remarks: input.remarks?.trim() ?? null,
    notifyDoctor: input.notifyDoctor ?? false,
  });

  // Update batch running totals
  await updateBatchRecord(input.batchId, {
    totalMortality: mortalityTotal,
    currentBirdCount: birdCount,
    status: batch.status === "PLACED" ? "ACTIVE" : batch.status,
  });

  logAction({ userId: supervisorId, action: "create", entity: "DailyVisit", entityId: visit.id, ip });
  return visit.toObject();
}

export { countTodaysVisits, findLastVisitForBatch };
