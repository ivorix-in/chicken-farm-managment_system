import { AppError } from "../../core/errors/AppError.js";
import { logAction } from "../../core/audit/auditLog.service.js";
import {
  createVehicleRecord,
  deleteVehicleRecord,
  findVehicleById,
  findVehicleByNo,
  findVehicles,
  updateVehicleRecord,
} from "./vehicles.repository.js";

export async function listVehicles(isActive?: boolean) {
  const list = await findVehicles(isActive);
  return { vehicles: list.map((v) => v.toObject()) };
}

export async function getVehicle(id: string) {
  const vehicle = await findVehicleById(id);
  if (!vehicle) throw new AppError(404, "Vehicle not found");
  return vehicle.toObject();
}

export async function createVehicle(data: { vehicleNo: string; model?: string | null; driverName?: string | null }, actorId: string, ip?: string) {
  const existing = await findVehicleByNo(data.vehicleNo);
  if (existing) throw new AppError(409, "Vehicle with this number already exists");
  
  const vehicle = await createVehicleRecord({
    vehicleNo: data.vehicleNo.trim().toUpperCase(),
    model: data.model?.trim() ?? null,
    driverName: data.driverName?.trim() ?? null,
  });
  
  logAction({ userId: actorId, action: "create", entity: "Vehicle", entityId: vehicle.id, ip });
  return vehicle.toObject();
}

export async function updateVehicle(id: string, data: Partial<{ vehicleNo: string; model: string | null; driverName: string | null; isActive: boolean }>, actorId: string, ip?: string) {
  const existing = await findVehicleById(id);
  if (!existing) throw new AppError(404, "Vehicle not found");
  
  if (data.vehicleNo && data.vehicleNo !== existing.vehicleNo) {
    const numberTaken = await findVehicleByNo(data.vehicleNo);
    if (numberTaken) throw new AppError(409, "Vehicle with this number already exists");
  }
  
  const updated = await updateVehicleRecord(id, {
    ...(data.vehicleNo && { vehicleNo: data.vehicleNo.trim().toUpperCase() }),
    ...(data.model !== undefined && { model: data.model }),
    ...(data.driverName !== undefined && { driverName: data.driverName }),
    ...(data.isActive !== undefined && { isActive: data.isActive }),
  });
  
  logAction({ userId: actorId, action: "update", entity: "Vehicle", entityId: id, changes: data as Record<string, unknown>, ip });
  return updated!.toObject();
}

export async function deleteVehicle(id: string, actorId: string, ip?: string) {
  const existing = await findVehicleById(id);
  if (!existing) throw new AppError(404, "Vehicle not found");
  
  await deleteVehicleRecord(id);
  logAction({ userId: actorId, action: "delete", entity: "Vehicle", entityId: id, ip });
}
