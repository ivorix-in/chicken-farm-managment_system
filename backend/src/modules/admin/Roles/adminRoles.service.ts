import type { Prisma } from "@prisma/client";
import { prisma } from "../../../core/prisma.js";
import { AppError } from "../../../core/errors/AppError.js";

function normalizeRoleCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/gu, "_");
}

/** List roles with admin-assignment counts. */
export async function listRoles() {
  return prisma.adminRole.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { adminUsers: true },
      },
    },
  });
}

/** Create role. Persists permissions as JSON array (or ["*"]). */
export async function createRole(input: {
  name: string;
  code: string;
  permissions: string[];
}) {
  const code = normalizeRoleCode(input.code);
  const existing = await prisma.adminRole.findUnique({ where: { code } });
  if (existing) {
    throw new AppError(409, "Role code already exists");
  }

  const perms =
    input.permissions.includes("*") && input.permissions.length > 1
      ? ["*"]
      : input.permissions.filter((p) => p.length > 0);

  const role = await prisma.adminRole.create({
    data: {
      name: input.name.trim(),
      code,
      permissions: (perms.length ? perms : []) as Prisma.InputJsonValue,
    },
  });

  return { ...role, _count: { adminUsers: 0 } };
}

export async function updateRole(
  roleId: string,
  input: Partial<{ name: string; code: string; permissions: string[] }>
) {
  const current = await prisma.adminRole.findUnique({ where: { id: roleId } });
  if (!current) {
    throw new AppError(404, "Role not found");
  }

  let code = input.code !== undefined ? normalizeRoleCode(input.code) : undefined;
  if (code !== undefined && code !== current.code) {
    const taken = await prisma.adminRole.findFirst({
      where: { code, NOT: { id: roleId } },
    });
    if (taken) {
      throw new AppError(409, "Role code already exists");
    }
  }

  let permissions: unknown | undefined;
  if (input.permissions !== undefined) {
    const perms =
      input.permissions.includes("*") && input.permissions.length > 1
        ? ["*"]
        : input.permissions.filter((p) => p.length > 0);
    permissions = perms;
  }

  const role = await prisma.adminRole.update({
    where: { id: roleId },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(code !== undefined ? { code } : {}),
      ...(permissions !== undefined
        ? { permissions: permissions as Prisma.InputJsonValue }
        : {}),
    },
    include: {
      _count: { select: { adminUsers: true } },
    },
  });

  return role;
}

export async function deleteRole(roleId: string) {
  const current = await prisma.adminRole.findUnique({
    where: { id: roleId },
    include: {
      _count: { select: { adminUsers: true } },
    },
  });

  if (!current) {
    throw new AppError(404, "Role not found");
  }

  if (current._count.adminUsers > 0) {
    throw new AppError(
      409,
      `Cannot delete role assigned to ${current._count.adminUsers} admin(s). Reassign them first.`
    );
  }

  await prisma.adminRole.delete({
    where: { id: roleId },
  });
}
