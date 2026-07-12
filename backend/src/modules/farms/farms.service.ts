import { AppError } from "../../core/errors/AppError.js";
import { logAction } from "../../core/audit/auditLog.service.js";
import { FarmStatus } from "./models/index.js";
import {
  FarmFilters,
  countActiveFarms,
  createFarmRecord,
  findFarmById,
  findFarms,
  softDeleteFarmRecord,
  updateFarmRecord,
} from "./farms.repository.js";

export interface CreateFarmInput {
  name: string;
  farmerId: string;
  supervisorId?: string;
  areaId?: string;
  address: string;
  capacity: number;
}

export interface UpdateFarmInput {
  name?: string;
  farmerId?: string;
  supervisorId?: string | null;
  areaId?: string | null;
  address?: string;
  capacity?: number;
  status?: FarmStatus;
  isActive?: boolean;
}

export async function listFarms(filters: FarmFilters, page: number, limit: number) {
  const { rows, total } = await findFarms(filters, page, limit);
  return {
    farms: rows.map((r) => r.toObject()),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getFarm(id: string) {
  const farm = await findFarmById(id);
  if (!farm) throw new AppError(404, "Farm not found");
  return farm.toObject();
}

export async function createFarm(input: CreateFarmInput, actorId: string, ip?: string) {
  const farm = await createFarmRecord({
    name: input.name.trim(),
    farmerId: input.farmerId,
    supervisorId: input.supervisorId ?? null,
    areaId: input.areaId ?? null,
    address: input.address.trim(),
    capacity: input.capacity,
    status: "PENDING",
    isActive: true,
    deletedAt: null,
  });
  logAction({ userId: actorId, action: "create", entity: "Farm", entityId: farm.id, ip });
  return farm.toObject();
}

export async function updateFarm(id: string, input: UpdateFarmInput, actorId: string, ip?: string) {
  const existing = await findFarmById(id);
  if (!existing) throw new AppError(404, "Farm not found");

  const updated = await updateFarmRecord(id, {
    ...(input.name && { name: input.name.trim() }),
    ...(input.farmerId && { farmerId: input.farmerId }),
    ...(input.supervisorId !== undefined && { supervisorId: input.supervisorId }),
    ...(input.areaId !== undefined && { areaId: input.areaId }),
    ...(input.address && { address: input.address.trim() }),
    ...(input.capacity && { capacity: input.capacity }),
    ...(input.status && { status: input.status }),
    ...(input.isActive !== undefined && { isActive: input.isActive }),
  });

  logAction({ userId: actorId, action: "update", entity: "Farm", entityId: id, changes: input as Record<string, unknown>, ip });
  return updated!.toObject();
}

export async function deleteFarm(id: string, actorId: string, ip?: string) {
  const existing = await findFarmById(id);
  if (!existing) throw new AppError(404, "Farm not found");
  if (existing.currentBatchId) throw new AppError(400, "Cannot delete a farm with an active batch");

  await softDeleteFarmRecord(id);
  logAction({ userId: actorId, action: "delete", entity: "Farm", entityId: id, ip });
}

export { countActiveFarms };
