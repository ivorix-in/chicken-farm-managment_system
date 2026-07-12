import { api } from '../../Auth/api/adminAuthApi';

export interface Area {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export async function fetchAreas(): Promise<Area[]> {
  const { data } = await api.get<{ data: Area[] }>('/api/v1/admin/areas');
  return data.data;
}

export async function createArea(area: Partial<Area>): Promise<Area> {
  const { data } = await api.post<{ data: Area }>('/api/v1/admin/areas', area);
  return data.data;
}

export async function updateArea(id: string, area: Partial<Area>): Promise<Area> {
  const { data } = await api.put<{ data: Area }>(`/api/v1/admin/areas/${id}`, area);
  return data.data;
}
