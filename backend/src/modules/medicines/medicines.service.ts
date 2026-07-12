import { AppError } from "../../core/errors/AppError.js";
import { logAction } from "../../core/audit/auditLog.service.js";
import { MedicineUnit, IPrescriptionMedicine } from "./models/index.js";
import {
  createMedicineRecord,
  createPrescriptionRecord,
  findMedicineById,
  findMedicines,
  findPrescriptionById,
  findPrescriptions,
  getLowMedicineAlerts,
  incrementMedicineStock,
  softDeleteMedicineRecord,
  updateMedicineRecord,
  updatePrescriptionStatus,
} from "./medicines.repository.js";

// ---- Medicines ----

export async function listMedicines(isActive?: boolean, page = 1, limit = 20) {
  const { rows, total } = await findMedicines(isActive, page, limit);
  return { medicines: rows.map((r) => r.toObject()), total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getMedicine(id: string) {
  const med = await findMedicineById(id);
  if (!med) throw new AppError(404, "Medicine not found");
  return med.toObject();
}

export async function createMedicine(input: { name: string; manufacturer?: string; batchNo: string; expiryDate: string; quantityUnits: number; unit: MedicineUnit; unitCost: number; lowStockThreshold?: number }, actorId: string, ip?: string) {
  const med = await createMedicineRecord({
    name: input.name.trim(),
    manufacturer: input.manufacturer?.trim() ?? null,
    batchNo: input.batchNo.trim(),
    expiryDate: new Date(input.expiryDate),
    quantityUnits: input.quantityUnits,
    unit: input.unit,
    unitCost: input.unitCost,
    lowStockThreshold: input.lowStockThreshold ?? 10,
    isActive: true,
    deletedAt: null,
  });
  logAction({ userId: actorId, action: "create", entity: "Medicine", entityId: med.id, ip });
  return med.toObject();
}

export async function updateMedicine(id: string, input: Partial<{ name: string; manufacturer: string | null; batchNo: string; expiryDate: string; quantityUnits: number; unit: MedicineUnit; unitCost: number; lowStockThreshold: number; isActive: boolean }>, actorId: string, ip?: string) {
  const existing = await findMedicineById(id);
  if (!existing) throw new AppError(404, "Medicine not found");
  const updated = await updateMedicineRecord(id, {
    ...(input.name && { name: input.name.trim() }),
    ...(input.manufacturer !== undefined && { manufacturer: input.manufacturer }),
    ...(input.batchNo && { batchNo: input.batchNo.trim() }),
    ...(input.expiryDate && { expiryDate: new Date(input.expiryDate) }),
    ...(input.quantityUnits !== undefined && { quantityUnits: input.quantityUnits }),
    ...(input.unit && { unit: input.unit }),
    ...(input.unitCost !== undefined && { unitCost: input.unitCost }),
    ...(input.lowStockThreshold !== undefined && { lowStockThreshold: input.lowStockThreshold }),
    ...(input.isActive !== undefined && { isActive: input.isActive }),
  });
  logAction({ userId: actorId, action: "update", entity: "Medicine", entityId: id, changes: input as Record<string, unknown>, ip });
  return updated!.toObject();
}

export async function deleteMedicine(id: string, actorId: string, ip?: string) {
  const existing = await findMedicineById(id);
  if (!existing) throw new AppError(404, "Medicine not found");
  await softDeleteMedicineRecord(id);
  logAction({ userId: actorId, action: "delete", entity: "Medicine", entityId: id, ip });
}

// ---- Prescriptions ----

export async function listPrescriptions(filters: { batchId?: string; doctorId?: string; status?: string }, page = 1, limit = 20) {
  const { rows, total } = await findPrescriptions(filters, page, limit);
  return { prescriptions: rows.map((r) => r.toObject()), total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getPrescription(id: string) {
  const p = await findPrescriptionById(id);
  if (!p) throw new AppError(404, "Prescription not found");
  return p.toObject();
}

export async function createPrescription(input: { batchId: string; medicines: IPrescriptionMedicine[]; instructions?: string }, doctorId: string, ip?: string) {
  const p = await createPrescriptionRecord({
    batchId: input.batchId,
    doctorId,
    medicines: input.medicines,
    instructions: input.instructions?.trim() ?? null,
    prescribedAt: new Date(),
    status: "PENDING",
    dispensedAt: null,
  });
  logAction({ userId: doctorId, action: "create", entity: "Prescription", entityId: p.id, ip });
  return p.toObject();
}

export async function dispensePrescription(id: string, actorId: string, ip?: string) {
  const p = await findPrescriptionById(id);
  if (!p) throw new AppError(404, "Prescription not found");
  if (p.status === "DISPENSED") throw new AppError(400, "Prescription already dispensed");

  // Deduct stock for each medicine
  for (const pm of p.medicines) {
    const med = await findMedicineById(pm.medicineId);
    if (!med) throw new AppError(404, `Medicine ${pm.medicineId} not found`);
    // Deduct 1 unit per day per dosage line (simplified model)
    const totalUnits = pm.durationDays;
    if (med.quantityUnits < totalUnits) {
      throw new AppError(400, `Insufficient stock for ${med.name}. Required: ${totalUnits}, available: ${med.quantityUnits}`);
    }
    await incrementMedicineStock(pm.medicineId, -totalUnits);
  }

  const updated = await updatePrescriptionStatus(id, "DISPENSED", new Date());
  logAction({ userId: actorId, action: "dispense", entity: "Prescription", entityId: id, ip });
  return updated!.toObject();
}

export { getLowMedicineAlerts };
