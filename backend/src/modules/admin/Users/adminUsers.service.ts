import { AdminRole, AdminUser } from "../models/index.js";
import { AppError } from "../../../core/errors/AppError.js";
import { hashPassword, normalizeEmail } from "../Auth/adminAuth.helper.js";

export async function listAdminRolesForPicker() {
  const roles = await AdminRole.find().sort({ name: "asc" }).select("name code");
  return roles.map((role) => ({
    id: role.id,
    name: role.name,
    code: role.code,
  }));
}

export async function createAdminUser(input: {
  email: string;
  password: string;
  name: string;
  roleId: string;
}) {
  const email = normalizeEmail(input.email);
  const role = await AdminRole.findById(input.roleId);
  if (!role) {
    throw new AppError(400, "Role not found");
  }

  const existing = await AdminUser.findOne({ email });
  if (existing) {
    throw new AppError(409, "An admin with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);

  const adminUser = await AdminUser.create({
    email,
    passwordHash,
    name: input.name.trim(),
    roleId: role.id,
  });

  return {
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
    mobileNumber: adminUser.mobileNumber ?? null,
    role: {
      id: role.id,
      name: role.name,
      code: role.code,
      permissions: role.permissions,
    },
  };
}
