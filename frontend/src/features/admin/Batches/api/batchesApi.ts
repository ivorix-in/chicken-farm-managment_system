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
  const { data } = await api.get<{ batches: Batch[] }>('/api/v1/admin/batches');
  return data.batches;
}

export interface CreateBatchPayload {
  farmId: string;
  batchNo: string;
  chickCount: number;
  placementDate: string;
  expectedClosureDate?: string;
  notes?: string;
  chickPurchase?: {
    supplierId?: string;
    pricePerChick: number;
    totalAmount: number;
    purchasedAt: string;
    vendor?: string;
    breed?: string;
  };
}

export async function createBatch(payload: CreateBatchPayload): Promise<Batch> {
  const { data } = await api.post<{ batch: Batch }>('/api/v1/admin/batches', payload);
  return data.batch;
}

export interface BatchSummary {
  batchId: string;
  batchNo: string;
  status: string;
  chickCount: number;
  currentBirdCount: number;
  totalMortality: number;
  currentAgeDays: number;
  averageWeightKg: number;
  totalFeedUsedKg: number;
  lastVisitDate: string | null;
}

export async function fetchBatchSummary(id: string): Promise<BatchSummary> {
  const { data } = await api.get<{ summary: BatchSummary }>(`/api/v1/admin/batches/${id}/summary`);
  return data.summary;
}

export async function fetchBatch(id: string): Promise<Batch> {
  const { data } = await api.get<{ batch: Batch }>(`/api/v1/admin/batches/${id}`);
  return data.batch;
}
