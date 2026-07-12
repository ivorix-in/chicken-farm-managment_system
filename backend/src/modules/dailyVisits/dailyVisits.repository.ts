import { DailyVisit, IDailyVisit } from "./models/index.js";

export interface VisitFilters {
  batchId?: string;
  supervisorId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export async function findVisits(filters: VisitFilters, page: number, limit: number) {
  const query: Record<string, any> = {};
  if (filters.batchId) query.batchId = filters.batchId;
  if (filters.supervisorId) query.supervisorId = filters.supervisorId;
  if (filters.dateFrom || filters.dateTo) {
    query.visitDate = {};
    if (filters.dateFrom) query.visitDate.$gte = filters.dateFrom;
    if (filters.dateTo) query.visitDate.$lte = filters.dateTo;
  }
  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    DailyVisit.find(query).populate("supervisorId", "name email").sort({ visitDate: -1 }).skip(skip).limit(limit),
    DailyVisit.countDocuments(query),
  ]);
  return { rows, total };
}

export async function findVisitById(id: string) {
  return DailyVisit.findById(id).populate("supervisorId", "name email").populate("batchId", "batchNo farmId");
}

export async function findVisitByBatchAndDate(batchId: string, visitDate: Date) {
  return DailyVisit.findOne({ batchId, visitDate });
}

export async function findLastVisitForBatch(batchId: string) {
  return DailyVisit.findOne({ batchId }).sort({ visitDate: -1 });
}

export async function createVisitRecord(data: Partial<IDailyVisit>) {
  return DailyVisit.create(data);
}

export async function countTodaysVisits() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return DailyVisit.countDocuments({ visitDate: { $gte: start, $lte: end } });
}
