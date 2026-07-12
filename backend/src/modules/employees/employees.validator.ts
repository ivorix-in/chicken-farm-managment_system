import { z } from "zod";

const departments = ["SUPERVISOR", "DOCTOR", "ACCOUNTANT", "MANAGER", "STAFF"] as const;

export const createEmployeeBody = z.object({
  adminUserId: z.string().uuid().optional(),
  name: z.string().min(2).max(100),
  phone: z.string().min(7).max(20),
  email: z.string().email().optional(),
  department: z.enum(departments),
  salary: z.number().min(0),
  joiningDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

export const updateEmployeeBody = z.object({
  adminUserId: z.string().uuid().nullable().optional(),
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(7).max(20).optional(),
  email: z.string().email().nullable().optional(),
  department: z.enum(departments).optional(),
  salary: z.number().min(0).optional(),
  joiningDate: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const listEmployeesQuery = z.object({
  department: z.enum(departments).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
