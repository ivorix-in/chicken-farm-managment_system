import { Medicine, Prescription, IMedicine, IPrescription } from "./models/index.js";

// ----- Medicine queries -----

export async function findMedicines(isActive?: boolean, page = 1, limit = 20) {
  const query: Record<string, unknown> = { deletedAt: null };
  if (isActive !== undefined) query.isActive = isActive;
  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    Medicine.find(query).sort({ name: 1 }).skip(skip).limit(limit),
    Medicine.countDocuments(query),
  ]);
  return { rows, total };
}

export async function findMedicineById(id: string) {
  return Medicine.findOne({ _id: id, deletedAt: null });
}

export async function createMedicineRecord(data: Partial<IMedicine>) {
  return Medicine.create(data);
}

export async function updateMedicineRecord(id: string, data: Partial<IMedicine>) {
  return Medicine.findByIdAndUpdate(id, data, { new: true });
}

export async function softDeleteMedicineRecord(id: string) {
  return Medicine.findByIdAndUpdate(id, { deletedAt: new Date(), isActive: false }, { new: true });
}

export async function incrementMedicineStock(id: string, delta: number) {
  return Medicine.findByIdAndUpdate(id, { $inc: { quantityUnits: delta } }, { new: true });
}

export async function getLowMedicineAlerts() {
  return Medicine.find({ deletedAt: null, $expr: { $lte: ["$quantityUnits", "$lowStockThreshold"] } });
}

// ----- Prescription queries -----

export async function findPrescriptions(filters: { batchId?: string; doctorId?: string; status?: string }, page = 1, limit = 20) {
  const query: Record<string, unknown> = {};
  if (filters.batchId) query.batchId = filters.batchId;
  if (filters.doctorId) query.doctorId = filters.doctorId;
  if (filters.status) query.status = filters.status;
  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    Prescription.find(query).populate("doctorId", "name email").populate("batchId", "batchNo").sort({ prescribedAt: -1 }).skip(skip).limit(limit),
    Prescription.countDocuments(query),
  ]);
  return { rows, total };
}

export async function findPrescriptionById(id: string) {
  return Prescription.findById(id).populate("doctorId", "name email").populate("batchId", "batchNo farmId");
}

export async function createPrescriptionRecord(data: Partial<IPrescription>) {
  return Prescription.create(data);
}

export async function updatePrescriptionStatus(id: string, status: "PENDING" | "DISPENSED", dispensedAt?: Date) {
  return Prescription.findByIdAndUpdate(id, { status, dispensedAt: dispensedAt ?? null }, { new: true });
}
