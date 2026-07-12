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
  cullsToday: number;
  weakBirdsToday: number;
  ownUseToday: number;
  approxWeightKg: number;
  feedUsedKg: number;
  feedBagsUsed: number;
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

  const totalLossesToday = input.mortalityToday + input.cullsToday + input.ownUseToday;
  if (totalLossesToday > previousBirdCount) {
    throw new AppError(400, "Total deductions today cannot exceed current bird count");
  }

  const mortalityTotal = previousMortality + input.mortalityToday;
  const birdCount = previousBirdCount - totalLossesToday;

  const visit = await createVisitRecord({
    batchId: input.batchId,
    supervisorId,
    visitDate,
    mortalityToday: input.mortalityToday,
    cullsToday: input.cullsToday,
    weakBirdsToday: input.weakBirdsToday,
    ownUseToday: input.ownUseToday,
    mortalityTotal,
    birdCount,
    approxWeightKg: input.approxWeightKg,
    feedUsedKg: input.feedUsedKg,
    feedBagsUsed: input.feedBagsUsed,
    remarks: input.remarks?.trim() ?? null,
    notifyDoctor: input.notifyDoctor ?? false,
  });

  // Fetch the latest batch again to update its cumulative counts
  const freshBatch = await findBatchById(input.batchId);
  const newCulls = (freshBatch?.totalCulls || 0) + input.cullsToday;
  const newWeak = (freshBatch?.totalWeakBirds || 0) + input.weakBirdsToday;
  const newOwnUse = (freshBatch?.totalOwnUse || 0) + input.ownUseToday;

  await updateBatchRecord(input.batchId, {
    totalMortality: mortalityTotal,
    totalCulls: newCulls,
    totalWeakBirds: newWeak,
    totalOwnUse: newOwnUse,
    currentBirdCount: birdCount,
    status: birdCount === 0 ? "COMPLETED" : (batch.status === "PROGRESS" ? "PROGRESS" : batch.status),
  });

  logAction({ userId: supervisorId, action: "create", entity: "DailyVisit", entityId: visit.id, ip });
  return visit.toObject();
}

export { countTodaysVisits, findLastVisitForBatch };
