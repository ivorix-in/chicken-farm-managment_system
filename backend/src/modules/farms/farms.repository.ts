import { Farm, FarmStatus } from "./models/index.js";

export interface FarmFilters {
  farmerId?: string;
  supervisorId?: string;
  areaId?: string;
  status?: FarmStatus;
  isActive?: boolean;
}

export async function findFarms(filters: FarmFilters, page: number, limit: number) {
  const query: Record<string, unknown> = { deletedAt: null };
  if (filters.farmerId) query.farmerId = filters.farmerId;
  if (filters.supervisorId) query.supervisorId = filters.supervisorId;
  if (filters.areaId) query.areaId = filters.areaId;
  if (filters.status) query.status = filters.status;
  if (filters.isActive !== undefined) query.isActive = filters.isActive;

  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    Farm.find(query)
      .populate("farmerId", "name phone")
      .populate("areaId", "name code")
      .populate("supervisorId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Farm.countDocuments(query),
  ]);
  return { rows, total };
}

export async function findFarmById(id: string) {
  return Farm.findOne({ _id: id, deletedAt: null })
    .populate("farmerId", "name phone address")
    .populate("areaId", "name code")
    .populate("supervisorId", "name email");
}

export async function createFarmRecord(data: Record<string, unknown>) {
  return Farm.create(data);
}

export async function updateFarmRecord(id: string, data: Record<string, unknown>) {
  return Farm.findByIdAndUpdate(id, data, { new: true });
}

export async function softDeleteFarmRecord(id: string) {
  return Farm.findByIdAndUpdate(id, { deletedAt: new Date(), isActive: false }, { new: true });
}

export async function countActiveFarms() {
  return Farm.countDocuments({ status: "ACTIVE", deletedAt: null });
}
