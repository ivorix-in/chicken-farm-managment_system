import { api } from '../../Auth/api/adminAuthApi';

export interface Farm {
  id: string;
  name: string;
  address: string;
  farmerId: string;
  supervisorId?: string;
  areaId?: string;
  capacity: number;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  createdAt: string;
}

export async function fetchFarms(): Promise<Farm[]> {
  const { data } = await api.get<{ farms: Farm[] }>('/api/v1/admin/farms');
  return data.farms;
}

export async function createFarm(farm: Partial<Farm>): Promise<Farm> {
  const { data } = await api.post<{ farm: Farm }>('/api/v1/admin/farms', farm);
  return data.farm;
}

export async function updateFarm(id: string, farm: Partial<Farm>): Promise<Farm> {
  const { data } = await api.put<{ farm: Farm }>(`/api/v1/admin/farms/${id}`, farm);
  return data.farm;
}

export async function deleteFarm(id: string): Promise<void> {
  await api.delete(`/api/v1/admin/farms/${id}`);
}
