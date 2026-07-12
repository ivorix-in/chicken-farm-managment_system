import { Batch, IBatch, BatchStatus } from "./models/index.js";

export interface BatchFilters {
  farmId?: string;
  status?: BatchStatus;
  createdBy?: string;
}

export async function findBatches(filters: BatchFilters, page: number, limit: number) {
  const query: Record<string, unknown> = {};
  if (filters.farmId) query.farmId = filters.farmId;
  if (filters.status) query.status = filters.status;
  if (filters.createdBy) query.createdBy = filters.createdBy;

  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    Batch.find(query)
      .populate("farmId", "name address capacity")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Batch.countDocuments(query),
  ]);
  return { rows, total };
}

export async function findBatchById(id: string) {
  return Batch.findById(id).populate("farmId", "name address capacity farmerId supervisorId");
}

export async function findActiveBatchForFarm(farmId: string) {
  return Batch.findOne({ farmId, status: { $in: ["PROGRESS", "COMPLETED"] } });
}

export async function createBatchRecord(data: Partial<IBatch>) {
  return Batch.create(data);
}

export async function updateBatchRecord(id: string, data: Partial<IBatch>) {
  return Batch.findByIdAndUpdate(id, data, { new: true });
}

export async function countActiveBatches() {
  return Batch.countDocuments({ status: { $in: ["PROGRESS", "COMPLETED"] } });
}

export async function sumActiveBirds() {
  const result = await Batch.aggregate([
    { $match: { status: { $in: ["PROGRESS", "COMPLETED"] } } },
    { $group: { _id: null, totalBirds: { $sum: "$currentBirdCount" }, totalMortality: { $sum: "$totalMortality" }, totalChicks: { $sum: "$chickCount" } } },
  ]);
  return result[0] ?? { totalBirds: 0, totalMortality: 0, totalChicks: 0 };
}
