import { prisma } from "../../../core/prisma.js";
import { AppError } from "../../../core/errors/AppError.js";
import { hashPassword, normalizeEmail } from "../Auth/adminAuth.helper.js";

export async function listAdminRolesForPicker() {
  return prisma.adminRole.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      code: true,
    },
  });
}

export async function createAdminUser(input: {
  email: string;
  password: string;
  name: string;
  roleId: string;
}) {
  const email = normalizeEmail(input.email);
  const role = await prisma.adminRole.findUnique({
    where: { id: input.roleId },
  });
  if (!role) {
    throw new AppError(400, "Role not found");
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    throw new AppError(409, "An admin with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);

  const adminUser = await prisma.adminUser.create({
    data: {
      email,
      passwordHash,
      name: input.name.trim(),
      roleId: role.id,
    },
    include: {
      role: {
        select: {
          id: true,
          name: true,
          code: true,
          permissions: true,
        },
      },
    },
  });

  return {
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
    mobileNumber: adminUser.mobileNumber,
    role: adminUser.role,
  };
}
