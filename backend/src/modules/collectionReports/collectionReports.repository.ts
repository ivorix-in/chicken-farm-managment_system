import { CollectionReport, ICollectionReport } from "./models/index.js";

export interface CollectionReportFilters {
  farmId?: string;
  vehicleId?: string;
  status?: string;
}

export async function findCollectionReports(filters: CollectionReportFilters, page: number, limit: number) {
  const query: Record<string, unknown> = {};
  if (filters.farmId) query.farmId = filters.farmId;
  if (filters.vehicleId) query.vehicleId = filters.vehicleId;
  if (filters.status) query.status = filters.status;

  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    CollectionReport.find(query)
      .populate("farmId", "name address")
      .populate("vehicleId", "vehicleNo driverName")
      .populate("batchId", "batchNo")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    CollectionReport.countDocuments(query),
  ]);
  return { rows, total };
}

export async function findCollectionReportById(id: string) {
  return CollectionReport.findById(id)
    .populate("farmId", "name address capacity")
    .populate("vehicleId", "vehicleNo driverName model")
    .populate("batchId", "batchNo chickCount status currentBirdCount");
}

export async function createCollectionReportRecord(data: Partial<ICollectionReport>) {
  return CollectionReport.create(data);
}

export async function updateCollectionReportRecord(id: string, data: Partial<ICollectionReport>) {
  return CollectionReport.findByIdAndUpdate(id, data, { new: true })
    .populate("farmId", "name address capacity")
    .populate("vehicleId", "vehicleNo driverName model")
    .populate("batchId", "batchNo chickCount status currentBirdCount");
}

export async function deleteCollectionReportRecord(id: string) {
  return CollectionReport.findByIdAndDelete(id);
}
