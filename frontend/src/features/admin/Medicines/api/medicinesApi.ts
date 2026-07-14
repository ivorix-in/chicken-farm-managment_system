import { api } from '../../Auth/api/adminAuthApi';

export interface Medicine {
  id: string;
  name: string;
  batchNo: string;
  expiryDate: string;
  quantityUnits: number;
  lowStockThreshold: number;
  unit: string;
  unitCost: number;
  manufacturer?: string;
  createdAt: string;
}

export async function fetchMedicines(): Promise<Medicine[]> {
  const { data } = await api.get<{ medicines: Medicine[] }>('/api/v1/admin/medicines');
  return data.medicines;
}

export async function createMedicine(medicine: Partial<Medicine>): Promise<Medicine> {
  const { data } = await api.post<{ medicine: Medicine }>('/api/v1/admin/medicines', medicine);
  return data.medicine;
}

export async function updateMedicine(id: string, medicine: Partial<Medicine>): Promise<Medicine> {
  const { data } = await api.put<{ medicine: Medicine }>(`/api/v1/admin/medicines/${id}`, medicine);
  return data.medicine;
}

export async function deleteMedicine(id: string): Promise<void> {
  await api.delete(`/api/v1/admin/medicines/${id}`);
}
