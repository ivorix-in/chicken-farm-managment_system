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
  const { data } = await api.get<{ areas: Area[] }>('/api/v1/admin/areas');
  return data.areas;
}

export async function createArea(area: Partial<Area>): Promise<Area> {
  const { data } = await api.post<{ area: Area }>('/api/v1/admin/areas', area);
  return data.area;
}

export async function updateArea(id: string, area: Partial<Area>): Promise<Area> {
  const { data } = await api.put<{ area: Area }>(`/api/v1/admin/areas/${id}`, area);
  return data.area;
}

export async function deleteArea(id: string): Promise<void> {
  await api.delete(`/api/v1/admin/areas/${id}`);
}
