import { Area } from "./models/index.js";

export async function findAreas(isActive?: boolean) {
  const query: Record<string, unknown> = {};
  if (isActive !== undefined) query.isActive = isActive;
  return Area.find(query).sort({ name: 1 });
}

export async function findAreaById(id: string) {
  return Area.findById(id);
}

export async function findAreaByCode(code: string) {
  return Area.findOne({ code });
}

export async function createAreaRecord(data: { name: string; code: string; description?: string | null }) {
  return Area.create({ name: data.name, code: data.code, description: data.description ?? null });
}

export async function updateAreaRecord(id: string, data: Partial<{ name: string; code: string; description: string | null; isActive: boolean }>) {
  return Area.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteAreaRecord(id: string) {
  return Area.findByIdAndDelete(id);
}
