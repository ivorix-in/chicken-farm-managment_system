import { Farmer } from "./models/index.js";

export interface FarmerFilters {
  name?: string;
  phone?: string;
  areaId?: string;
  isActive?: boolean;
}

export async function findFarmers(filters: FarmerFilters, page: number, limit: number) {
  const query: Record<string, unknown> = { deletedAt: null };

  if (filters.name) query.name = { $regex: filters.name, $options: "i" };
  if (filters.phone) query.phone = { $regex: filters.phone, $options: "i" };
  if (filters.areaId) query.areaId = filters.areaId;
  if (filters.isActive !== undefined) query.isActive = filters.isActive;

  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    Farmer.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Farmer.countDocuments(query),
  ]);

  return { rows, total };
}

export async function findFarmerById(id: string) {
  return Farmer.findOne({ _id: id, deletedAt: null });
}

export async function findFarmerByPhone(phone: string) {
  return Farmer.findOne({ phone, deletedAt: null });
}

export async function createFarmerRecord(data: Record<string, unknown>) {
  return Farmer.create(data);
}

export async function updateFarmerRecord(id: string, data: Record<string, unknown>) {
  return Farmer.findByIdAndUpdate(id, data, { new: true });
}

export async function softDeleteFarmerRecord(id: string) {
  return Farmer.findByIdAndUpdate(id, { deletedAt: new Date(), isActive: false }, { new: true });
}
