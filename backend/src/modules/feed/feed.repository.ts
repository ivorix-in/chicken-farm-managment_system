import { FeedStock, FeedTransaction, FeedType, IFeedTransaction } from "./models/index.js";

export async function findAllFeedStock() {
  return FeedStock.find().sort({ feedType: 1 });
}

export async function findFeedStockById(id: string) {
  return FeedStock.findById(id);
}

export async function findFeedStockByType(feedType: FeedType) {
  return FeedStock.findOne({ feedType });
}

export async function upsertFeedStock(feedType: FeedType, quantityKg: number, unitCostPerKg: number, lowStockThresholdKg: number) {
  return FeedStock.findOneAndUpdate(
    { feedType },
    { feedType, quantityKg, unitCostPerKg, lowStockThresholdKg },
    { new: true, upsert: true }
  );
}

export async function incrementFeedStock(id: string, delta: number) {
  return FeedStock.findByIdAndUpdate(id, { $inc: { quantityKg: delta } }, { new: true });
}

export async function findTransactions(filters: { batchId?: string; feedStockId?: string; type?: string }, page: number, limit: number) {
  const query: Record<string, unknown> = {};
  if (filters.batchId) query.batchId = filters.batchId;
  if (filters.feedStockId) query.feedStockId = filters.feedStockId;
  if (filters.type) query.type = filters.type;
  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    FeedTransaction.find(query)
      .populate("feedStockId", "feedType")
      .populate("batchId", "batchNo")
      .populate("issuedBy", "name email")
      .sort({ issuedAt: -1 })
      .skip(skip)
      .limit(limit),
    FeedTransaction.countDocuments(query),
  ]);
  return { rows, total };
}

export async function createTransactionRecord(data: Partial<IFeedTransaction>) {
  return FeedTransaction.create(data);
}

export async function getLowStockAlerts() {
  return FeedStock.find({ $expr: { $lte: ["$quantityKg", "$lowStockThresholdKg"] } });
}

export async function sumFeedUsedForBatch(batchId: string): Promise<number> {
  const result = await FeedTransaction.aggregate([
    { $match: { batchId, type: { $in: ["ISSUE", "RETURN"] } } },
    {
      $group: {
        _id: null,
        total: {
          $sum: {
            $cond: [
              { $eq: ["$type", "ISSUE"] },
              "$quantityKg",
              { $subtract: [0, "$quantityKg"] },
            ],
          },
        },
      },
    },
  ]);
  return result[0]?.total ?? 0;
}
