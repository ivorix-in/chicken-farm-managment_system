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
  const { data } = await api.get<{ data: FeedStock[] }>('/api/v1/admin/feed/stock');
  return data.data;
}
