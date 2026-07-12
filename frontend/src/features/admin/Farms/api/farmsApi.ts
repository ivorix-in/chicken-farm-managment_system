import { api } from '../../Auth/api/adminAuthApi';

export interface Farm {
  id: string;
  farmerId: string;
  supervisorId?: string;
  areaId?: string;
  capacity: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export async function fetchFarms(): Promise<Farm[]> {
  const { data } = await api.get<{ data: Farm[] }>('/api/v1/admin/farms');
  return data.data;
}

export async function createFarm(farm: Partial<Farm>): Promise<Farm> {
  const { data } = await api.post<{ data: Farm }>('/api/v1/admin/farms', farm);
  return data.data;
}

export async function updateFarm(id: string, farm: Partial<Farm>): Promise<Farm> {
  const { data } = await api.put<{ data: Farm }>(`/api/v1/admin/farms/${id}`, farm);
  return data.data;
}
