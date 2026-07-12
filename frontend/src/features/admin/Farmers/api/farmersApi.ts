import { api } from '../../Auth/api/adminAuthApi';

export interface Farmer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export async function fetchFarmers(): Promise<Farmer[]> {
  const { data } = await api.get<{ data: Farmer[] }>('/api/v1/admin/farmers');
  return data.data;
}

export async function createFarmer(farmer: Partial<Farmer>): Promise<Farmer> {
  const { data } = await api.post<{ data: Farmer }>('/api/v1/admin/farmers', farmer);
  return data.data;
}

export async function updateFarmer(id: string, farmer: Partial<Farmer>): Promise<Farmer> {
  const { data } = await api.put<{ data: Farmer }>(`/api/v1/admin/farmers/${id}`, farmer);
  return data.data;
}
