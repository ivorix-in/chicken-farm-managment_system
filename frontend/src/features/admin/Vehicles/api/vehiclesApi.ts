import { api } from '../../Auth/api/adminAuthApi';

export interface Vehicle {
  id: string;
  vehicleNo: string;
  model?: string | null;
  driverName?: string | null;
  isActive: boolean;
  createdAt: string;
}

export async function fetchVehicles(isActive?: boolean): Promise<Vehicle[]> {
  const { data } = await api.get<{ vehicles: Vehicle[] }>('/api/v1/admin/vehicles', {
    params: { ...(isActive !== undefined && { isActive }) },
  });
  return data.vehicles;
}

export async function createVehicle(vehicle: Partial<Vehicle>): Promise<Vehicle> {
  const { data } = await api.post<{ vehicle: Vehicle }>('/api/v1/admin/vehicles', vehicle);
  return data.vehicle;
}

export async function updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
  const { data } = await api.put<{ vehicle: Vehicle }>(`/api/v1/admin/vehicles/${id}`, vehicle);
  return data.vehicle;
}

export async function deleteVehicle(id: string): Promise<void> {
  await api.delete(`/api/v1/admin/vehicles/${id}`);
}
