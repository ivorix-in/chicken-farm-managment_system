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
  instructions?: string;
  createdAt: string;
}

export async function fetchMedicines(): Promise<Medicine[]> {
  const { data } = await api.get<{ medicines: Medicine[] }>('/api/v1/admin/medicines');
  return data.medicines;
}
