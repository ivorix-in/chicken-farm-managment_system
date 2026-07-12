import { Employee, IEmployee, EmployeeDepartment } from "./models/index.js";

export async function findEmployees(department?: EmployeeDepartment, page = 1, limit = 20) {
  const query: Record<string, unknown> = { deletedAt: null };
  if (department) query.department = department;
  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    Employee.find(query).sort({ name: 1 }).skip(skip).limit(limit),
    Employee.countDocuments(query),
  ]);
  return { rows, total };
}

export async function findEmployeeById(id: string) {
  return Employee.findOne({ _id: id, deletedAt: null });
}

export async function createEmployeeRecord(data: Partial<IEmployee>) {
  return Employee.create(data);
}

export async function updateEmployeeRecord(id: string, data: Partial<IEmployee>) {
  return Employee.findByIdAndUpdate(id, data, { new: true });
}

export async function softDeleteEmployeeRecord(id: string) {
  return Employee.findByIdAndUpdate(id, { deletedAt: new Date(), isActive: false }, { new: true });
}
