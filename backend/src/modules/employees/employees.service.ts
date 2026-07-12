import { AppError } from "../../core/errors/AppError.js";
import { logAction } from "../../core/audit/auditLog.service.js";
import { EmployeeDepartment } from "./models/index.js";
import {
  createEmployeeRecord,
  findEmployeeById,
  findEmployees,
  softDeleteEmployeeRecord,
  updateEmployeeRecord,
} from "./employees.repository.js";

export async function listEmployees(department?: EmployeeDepartment, page = 1, limit = 20) {
  const { rows, total } = await findEmployees(department, page, limit);
  return { employees: rows.map((r) => r.toObject()), total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getEmployee(id: string) {
  const emp = await findEmployeeById(id);
  if (!emp) throw new AppError(404, "Employee not found");
  return emp.toObject();
}

export async function createEmployee(
  input: { adminUserId?: string; name: string; phone: string; email?: string; department: EmployeeDepartment; salary: number; joiningDate: string },
  actorId: string,
  ip?: string
) {
  const emp = await createEmployeeRecord({
    adminUserId: input.adminUserId ?? null,
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() ?? null,
    department: input.department,
    salary: input.salary,
    joiningDate: new Date(input.joiningDate),
    isActive: true,
    deletedAt: null,
  });
  logAction({ userId: actorId, action: "create", entity: "Employee", entityId: emp.id, ip });
  return emp.toObject();
}

export async function updateEmployee(id: string, input: Partial<{ name: string; phone: string; email: string | null; department: EmployeeDepartment; salary: number; joiningDate: string; isActive: boolean; adminUserId: string | null }>, actorId: string, ip?: string) {
  const existing = await findEmployeeById(id);
  if (!existing) throw new AppError(404, "Employee not found");

  const updated = await updateEmployeeRecord(id, {
    ...(input.name && { name: input.name.trim() }),
    ...(input.phone && { phone: input.phone.trim() }),
    ...(input.email !== undefined && { email: input.email }),
    ...(input.department && { department: input.department }),
    ...(input.salary !== undefined && { salary: input.salary }),
    ...(input.joiningDate && { joiningDate: new Date(input.joiningDate) }),
    ...(input.isActive !== undefined && { isActive: input.isActive }),
    ...(input.adminUserId !== undefined && { adminUserId: input.adminUserId }),
  });
  logAction({ userId: actorId, action: "update", entity: "Employee", entityId: id, changes: input as Record<string, unknown>, ip });
  return updated!.toObject();
}

export async function deleteEmployee(id: string, actorId: string, ip?: string) {
  const existing = await findEmployeeById(id);
  if (!existing) throw new AppError(404, "Employee not found");
  await softDeleteEmployeeRecord(id);
  logAction({ userId: actorId, action: "delete", entity: "Employee", entityId: id, ip });
}
