import { api } from '../../Auth/api/adminAuthApi';

export interface Employee {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  department?: string;
  salary?: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export async function fetchEmployees(): Promise<Employee[]> {
  const { data } = await api.get<{ employees: Employee[] }>('/api/v1/admin/employees');
  return data.employees;
}

export async function createEmployee(employee: Partial<Employee>): Promise<Employee> {
  const { data } = await api.post<{ employee: Employee }>('/api/v1/admin/employees', employee);
  return data.employee;
}

export async function updateEmployee(id: string, employee: Partial<Employee>): Promise<Employee> {
  const { data } = await api.put<{ employee: Employee }>(`/api/v1/admin/employees/${id}`, employee);
  return data.employee;
}

export async function deleteEmployee(id: string): Promise<void> {
  await api.delete(`/api/v1/admin/employees/${id}`);
}
