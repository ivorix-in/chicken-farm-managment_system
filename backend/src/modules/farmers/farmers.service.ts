import { AppError } from "../../core/errors/AppError.js";
import { logAction } from "../../core/audit/auditLog.service.js";
import {
  FarmerFilters,
  createFarmerRecord,
  findFarmerById,
  findFarmerByPhone,
  findFarmers,
  softDeleteFarmerRecord,
  updateFarmerRecord,
} from "./farmers.repository.js";

export interface CreateFarmerInput {
  name: string;
  phone: string;
  email?: string;
  address: string;
  nic?: string;
  notes?: string;
}

export interface UpdateFarmerInput {
  name?: string;
  phone?: string;
  email?: string | null;
  address?: string;
  nic?: string | null;
  notes?: string | null;
  isActive?: boolean;
}

export async function listFarmers(filters: FarmerFilters, page: number, limit: number) {
  const { rows, total } = await findFarmers(filters, page, limit);
  return {
    farmers: rows.map((r) => r.toObject()),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getFarmer(id: string) {
  const farmer = await findFarmerById(id);
  if (!farmer) throw new AppError(404, "Farmer not found");
  return farmer.toObject();
}

export async function createFarmer(input: CreateFarmerInput, actorId: string, ip?: string) {
  const existing = await findFarmerByPhone(input.phone);
  if (existing) throw new AppError(409, "A farmer with this phone number already exists");

  const farmer = await createFarmerRecord({
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() ?? null,
    address: input.address.trim(),
    nic: input.nic?.trim() ?? null,
    notes: input.notes?.trim() ?? null,
    isActive: true,
    deletedAt: null,
  });

  logAction({ userId: actorId, action: "create", entity: "Farmer", entityId: farmer.id, ip });
  return farmer.toObject();
}

export async function updateFarmer(id: string, input: UpdateFarmerInput, actorId: string, ip?: string) {
  const existing = await findFarmerById(id);
  if (!existing) throw new AppError(404, "Farmer not found");

  if (input.phone && input.phone !== existing.phone) {
    const phoneTaken = await findFarmerByPhone(input.phone);
    if (phoneTaken) throw new AppError(409, "A farmer with this phone number already exists");
  }

  const updated = await updateFarmerRecord(id, {
    ...(input.name && { name: input.name.trim() }),
    ...(input.phone && { phone: input.phone.trim() }),
    ...(input.email !== undefined && { email: input.email }),
    ...(input.address && { address: input.address.trim() }),
    ...(input.nic !== undefined && { nic: input.nic }),
    ...(input.notes !== undefined && { notes: input.notes }),
    ...(input.isActive !== undefined && { isActive: input.isActive }),
  });

  logAction({ userId: actorId, action: "update", entity: "Farmer", entityId: id, changes: input as Record<string, unknown>, ip });
  return updated!.toObject();
}

export async function deleteFarmer(id: string, actorId: string, ip?: string) {
  const existing = await findFarmerById(id);
  if (!existing) throw new AppError(404, "Farmer not found");

  await softDeleteFarmerRecord(id);
  logAction({ userId: actorId, action: "delete", entity: "Farmer", entityId: id, ip });
}
