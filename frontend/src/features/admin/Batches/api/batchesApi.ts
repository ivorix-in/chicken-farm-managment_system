import { api } from '../../Auth/api/adminAuthApi';

export interface Batch {
  id: string;
  batchNo: string;
  farmId: string;
  status: 'ACTIVE' | 'CLOSED';
  startDate: string;
  chickPurchase?: {
    supplier: string;
    quantity: number;
    breed: string;
    unitCost: number;
  };
  createdAt: string;
}

export async function fetchBatches(): Promise<Batch[]> {
  const { data } = await api.get<{ data: Batch[] }>('/api/v1/admin/batches');
  return data.data;
}
