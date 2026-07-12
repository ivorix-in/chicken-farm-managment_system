import { AdminRole, AdminUser } from "../models/index.js";
import { AppError } from "../../../core/errors/AppError.js";

function normalizeRoleCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/gu, "_");
}

/** List roles with admin-assignment counts. */
export async function listRoles() {
  const roles = await AdminRole.find().sort({ name: "asc" });
  return Promise.all(
    roles.map(async (role) => {
      const count = await AdminUser.countDocuments({ roleId: role.id });
      return {
        ...role.toObject(),
        _count: { adminUsers: count },
      };
    })
  );
}

/** Create role. Persists permissions as JSON array (or ["*"]). */
export async function createRole(input: {
  name: string;
  code: string;
  permissions: string[];
}) {
  const code = normalizeRoleCode(input.code);
  const existing = await AdminRole.findOne({ code });
  if (existing) {
    throw new AppError(409, "Role code already exists");
  }

  const perms =
    input.permissions.includes("*") && input.permissions.length > 1
      ? ["*"]
      : input.permissions.filter((p) => p.length > 0);

  const role = await AdminRole.create({
    name: input.name.trim(),
    code,
    permissions: perms.length ? perms : [],
  });

  return { ...role.toObject(), _count: { adminUsers: 0 } };
}

export async function updateRole(
  roleId: string,
  input: Partial<{ name: string; code: string; permissions: string[] }>
) {
  const current = await AdminRole.findById(roleId);
  if (!current) {
    throw new AppError(404, "Role not found");
  }

  let code = input.code !== undefined ? normalizeRoleCode(input.code) : undefined;
  if (code !== undefined && code !== current.code) {
    const taken = await AdminRole.findOne({
      code,
      _id: { $ne: roleId },
    });
    if (taken) {
      throw new AppError(409, "Role code already exists");
    }
  }

  let permissions: string[] | undefined;
  if (input.permissions !== undefined) {
    const perms =
      input.permissions.includes("*") && input.permissions.length > 1
        ? ["*"]
        : input.permissions.filter((p) => p.length > 0);
    permissions = perms;
  }

  const updateData: any = {};
  if (input.name !== undefined) updateData.name = input.name.trim();
  if (code !== undefined) updateData.code = code;
  if (permissions !== undefined) updateData.permissions = permissions;

  const role = await AdminRole.findByIdAndUpdate(roleId, updateData, { new: true });
  if (!role) {
    throw new AppError(404, "Role not found");
  }

  const count = await AdminUser.countDocuments({ roleId });
  return { ...role.toObject(), _count: { adminUsers: count } };
}

export async function deleteRole(roleId: string) {
  const current = await AdminRole.findById(roleId);
  if (!current) {
    throw new AppError(404, "Role not found");
  }

  const count = await AdminUser.countDocuments({ roleId });
  if (count > 0) {
    throw new AppError(
      409,
      `Cannot delete role assigned to ${count} admin(s). Reassign them first.`
    );
  }

  await AdminRole.findByIdAndDelete(roleId);
}
