import { AppError } from "../../core/errors/AppError.js";
import { logAction } from "../../core/audit/auditLog.service.js";
import {
  createAreaRecord,
  deleteAreaRecord,
  findAreaById,
  findAreaByCode,
  findAreas,
  updateAreaRecord,
} from "./areas.repository.js";

function normalizeCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "_");
}

export async function listAreas(isActive?: boolean) {
  const rows = await findAreas(isActive);
  return rows.map((r) => r.toObject());
}

export async function getArea(id: string) {
  const area = await findAreaById(id);
  if (!area) throw new AppError(404, "Area not found");
  return area.toObject();
}

export async function createArea(input: { name: string; code: string; description?: string }, actorId: string, ip?: string) {
  const code = normalizeCode(input.code);
  const existing = await findAreaByCode(code);
  if (existing) throw new AppError(409, "An area with this code already exists");

  const area = await createAreaRecord({ name: input.name.trim(), code, description: input.description?.trim() ?? null });
  logAction({ userId: actorId, action: "create", entity: "Area", entityId: area.id, ip });
  return area.toObject();
}

export async function updateArea(id: string, input: Partial<{ name: string; code: string; description: string | null; isActive: boolean }>, actorId: string, ip?: string) {
  const existing = await findAreaById(id);
  if (!existing) throw new AppError(404, "Area not found");

  if (input.code) {
    const code = normalizeCode(input.code);
    const codeTaken = await findAreaByCode(code);
    if (codeTaken && codeTaken.id !== id) throw new AppError(409, "An area with this code already exists");
    input.code = code;
  }

  const updated = await updateAreaRecord(id, input);
  logAction({ userId: actorId, action: "update", entity: "Area", entityId: id, changes: input as Record<string, unknown>, ip });
  return updated!.toObject();
}

export async function deleteArea(id: string, actorId: string, ip?: string) {
  const existing = await findAreaById(id);
  if (!existing) throw new AppError(404, "Area not found");

  await deleteAreaRecord(id);
  logAction({ userId: actorId, action: "delete", entity: "Area", entityId: id, ip });
}
