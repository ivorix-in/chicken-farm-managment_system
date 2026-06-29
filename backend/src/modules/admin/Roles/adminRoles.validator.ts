import { z } from "zod";

/** Role codes are stable identifiers (UPPER_SNAKE-ish). */
const roleCodeRegex = /^[A-Z][A-Z0-9_]*$/u;

export const createRoleBody = z.object({
  name: z.string().min(1, "Name is required").max(128),
  code: z
    .string()
    .min(2)
    .max(64)
    .regex(roleCodeRegex, "Use uppercase letters, digits, underscore (e.g. OPERATIONS_MANAGER)"),
  permissions: z.array(z.string().min(1)).default([]),
});

export const updateRoleBody = z
  .object({
    name: z.string().min(1).max(128).optional(),
    code: z
      .string()
      .min(2)
      .max(64)
      .regex(roleCodeRegex)
      .optional(),
    permissions: z.array(z.string().min(1)).optional(),
  })
  .refine(
    (o) =>
      o.name !== undefined ||
      o.code !== undefined ||
      o.permissions !== undefined,
    "At least one field is required"
  );

export const roleIdParam = z.object({
  roleId: z.string().uuid(),
});
