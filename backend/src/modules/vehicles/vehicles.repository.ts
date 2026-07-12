import { Vehicle } from "./models/index.js";

export async function findVehicles(isActive?: boolean) {
  const query: Record<string, unknown> = {};
  if (isActive !== undefined) query.isActive = isActive;
  return Vehicle.find(query).sort({ vehicleNo: 1 });
}

export async function findVehicleById(id: string) {
  return Vehicle.findById(id);
}

export async function findVehicleByNo(vehicleNo: string) {
  return Vehicle.findOne({ vehicleNo });
}

export async function createVehicleRecord(data: { vehicleNo: string; model?: string | null; driverName?: string | null }) {
  return Vehicle.create(data);
}

export async function updateVehicleRecord(id: string, data: Partial<{ vehicleNo: string; model: string | null; driverName: string | null; isActive: boolean }>) {
  return Vehicle.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteVehicleRecord(id: string) {
  return Vehicle.findByIdAndDelete(id);
}
