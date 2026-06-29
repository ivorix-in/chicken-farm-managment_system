import { api } from '../../Auth/api/adminAuthApi';

const PREFIX = '/api/v1/admin';

export type AdminRoleDto = {
  id: string;
  name: string;
  code: string;
  permissions: unknown;
  createdAt?: string;
  updatedAt?: string;
  _count?: { adminUsers: number };
};

export async function fetchAdminRoles(): Promise<AdminRoleDto[]> {
  const { data } = await api.get<{ roles: AdminRoleDto[] }>(`${PREFIX}/roles`);
  return data.roles;
}

export async function fetchPermissionsCatalog(): Promise<{ permissions: string[] }> {
  const { data } = await api.get<{ permissions: string[] }>(`${PREFIX}/permissions-catalog`);
  return data;
}

export async function createAdminRole(payload: {
  name: string;
  code: string;
  permissions: string[];
}): Promise<{ role: AdminRoleDto }> {
  const { data } = await api.post<{ role: AdminRoleDto }>(`${PREFIX}/roles`, payload);
  return data;
}

export async function updateAdminRole(
  roleId: string,
  payload: Partial<{ name: string; code: string; permissions: string[] }>
): Promise<{ role: AdminRoleDto }> {
  const { data } = await api.patch<{ role: AdminRoleDto }>(`${PREFIX}/roles/${roleId}`, payload);
  return data;
}

export async function deleteAdminRole(roleId: string): Promise<void> {
  await api.delete(`${PREFIX}/roles/${roleId}`);
}
