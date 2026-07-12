import { api } from '../../Auth/api/adminAuthApi';

export interface FeedStock {
  id: string;
  feedType: string;
  quantityKg: number;
  lowStockThresholdKg: number;
  unitCostPerKg: number;
  createdAt: string;
  updatedAt: string;
}

export async function fetchFeedStock(): Promise<FeedStock[]> {
  const { data } = await api.get<{ stock: FeedStock[] }>('/api/v1/admin/feed/stock');
  return data.stock;
}

export interface FeedTransaction {
  id: string;
  batchId?: string;
  feedStockId: string;
  farmId?: string;
  type: 'IN' | 'OUT' | 'ISSUE' | 'RETURN' | 'RESTOCK';
  category?: 'GODOWN' | 'TMS_IN' | 'RETURN' | 'TRANSFER_OUT' | 'CONSUMPTION' | null;
  quantityKg: number;
  numberOfBags: number;
  cost?: number;
  reference?: string;
  notes?: string;
  date: string;
}

export async function fetchFeedTransactions(batchId?: string): Promise<FeedTransaction[]> {
  const params = new URLSearchParams();
  if (batchId) params.append('batchId', batchId);
  const { data } = await api.get<{ transactions: FeedTransaction[] }>(`/api/v1/admin/feed/transactions?${params.toString()}`);
  return data.transactions;
}
