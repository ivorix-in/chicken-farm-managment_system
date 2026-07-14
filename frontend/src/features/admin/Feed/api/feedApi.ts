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
  batchId?: { id: string; batchNo: string } | string | null;
  feedStockId: { id: string; feedType: string } | string;
  farmId?: string;
  type: 'IN' | 'OUT' | 'ISSUE' | 'RETURN' | 'RESTOCK';
  category?: 'GODOWN' | 'TMS_IN' | 'RETURN' | 'TRANSFER_OUT' | 'CONSUMPTION' | null;
  quantityKg: number;
  numberOfBags: number;
  cost?: number;
  reference?: string;
  notes?: string;
  date: string;
  issuedBy?: { name: string; email: string };
  issuedAt?: string;
}

export async function fetchFeedTransactions(batchId?: string): Promise<FeedTransaction[]> {
  const params = new URLSearchParams();
  if (batchId) params.append('batchId', batchId);
  const { data } = await api.get<{ transactions: FeedTransaction[] }>(`/api/v1/admin/feed/transactions?${params.toString()}`);
  return data.transactions;
}

export interface CreateFeedTransactionPayload {
  batchId?: string;
  feedStockId: string;
  quantityKg: number;
  numberOfBags?: number;
  type: 'ISSUE' | 'RETURN' | 'RESTOCK';
  category?: 'GODOWN' | 'TMS_IN' | 'RETURN' | 'TRANSFER_OUT' | 'CONSUMPTION';
  notes?: string;
}

export async function createFeedTransaction(payload: CreateFeedTransactionPayload): Promise<FeedTransaction> {
  const { data } = await api.post<{ transaction: FeedTransaction }>('/api/v1/admin/feed/transactions', payload);
  return data.transaction;
}
