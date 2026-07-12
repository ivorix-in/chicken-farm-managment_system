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
  const { data } = await api.get<{ farmers: Farmer[] }>('/api/v1/admin/farmers');
  return data.farmers;
}

export async function createFarmer(farmer: Partial<Farmer>): Promise<Farmer> {
  const { data } = await api.post<{ farmer: Farmer }>('/api/v1/admin/farmers', farmer);
  return data.farmer;
}

export async function updateFarmer(id: string, farmer: Partial<Farmer>): Promise<Farmer> {
  const { data } = await api.put<{ farmer: Farmer }>(`/api/v1/admin/farmers/${id}`, farmer);
  return data.farmer;
}
