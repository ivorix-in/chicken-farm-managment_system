import { AppError } from "../../core/errors/AppError.js";
import { logAction } from "../../core/audit/auditLog.service.js";
import { FeedType, FeedTransactionType } from "./models/index.js";
import {
  createTransactionRecord,
  findAllFeedStock,
  findFeedStockById,
  findTransactions,
  getLowStockAlerts,
  incrementFeedStock,
  upsertFeedStock,
  sumFeedUsedForBatch,
} from "./feed.repository.js";

export async function getFeedStock() {
  const rows = await findAllFeedStock();
  return rows.map((r) => r.toObject());
}

export async function setFeedStock(input: { feedType: FeedType; quantityKg: number; unitCostPerKg: number; lowStockThresholdKg: number }, actorId: string, ip?: string) {
  const stock = await upsertFeedStock(input.feedType, input.quantityKg, input.unitCostPerKg, input.lowStockThresholdKg);
  logAction({ userId: actorId, action: "update", entity: "FeedStock", entityId: stock!.id, changes: input as Record<string, unknown>, ip });
  return stock!.toObject();
}

export async function createFeedTransaction(
  input: { batchId?: string; feedStockId: string; quantityKg: number; numberOfBags?: number; type: FeedTransactionType; category?: string; notes?: string },
  actorId: string,
  ip?: string
) {
  const stock = await findFeedStockById(input.feedStockId);
  if (!stock) throw new AppError(404, "Feed stock not found");

  // ISSUE / RETURN adjustments
  let delta = 0;
  if (input.type === "ISSUE") {
    if (stock.quantityKg < input.quantityKg) {
      throw new AppError(400, `Insufficient feed stock. Available: ${stock.quantityKg} kg`);
    }
    delta = -input.quantityKg;
  } else if (input.type === "RETURN") {
    delta = input.quantityKg;
  } else if (input.type === "RESTOCK") {
    delta = input.quantityKg;
  }

  await incrementFeedStock(input.feedStockId, delta);

  const tx = await createTransactionRecord({
    batchId: input.batchId ?? null,
    feedStockId: input.feedStockId,
    quantityKg: input.quantityKg,
    numberOfBags: input.numberOfBags ?? 0,
    type: input.type,
    category: input.category as any ?? null,
    issuedBy: actorId,
    issuedAt: new Date(),
    notes: input.notes?.trim() ?? null,
  });

  logAction({ userId: actorId, action: "create", entity: "FeedTransaction", entityId: tx.id, ip });
  return tx.toObject();
}

export async function listFeedTransactions(filters: { batchId?: string; feedStockId?: string; type?: string }, page: number, limit: number) {
  const { rows, total } = await findTransactions(filters, page, limit);
  return { transactions: rows.map((r) => r.toObject()), total, page, limit, totalPages: Math.ceil(total / limit) };
}

export { getLowStockAlerts, sumFeedUsedForBatch };
