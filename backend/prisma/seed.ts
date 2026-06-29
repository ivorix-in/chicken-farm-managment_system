import { PrismaClient } from "@prisma/client";
import { hashPassword, normalizeEmail } from "../src/modules/admin/Auth/adminAuth.helper.js";

const prisma = new PrismaClient();

function defaultNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "admin";
  const cleaned = local.replace(/[._-]+/g, " ").trim();
  if (!cleaned) return "Admin";
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
}

async function ensureSuperAdminRole() {
  return prisma.adminRole.upsert({
    where: { code: "SUPER_ADMIN" },
    update: {},
    create: {
      name: "Super Admin",
      code: "SUPER_ADMIN",
      permissions: ["*"],
    },
  });
}

async function main() {
  const email = normalizeEmail(process.env.SEED_SUPER_ADMIN_EMAIL ?? "");
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("Skip seed: set SEED_SUPER_ADMIN_EMAIL and SEED_SUPER_ADMIN_PASSWORD to create super admin.");
    return;
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log("Skip seed: admin user already exists", email);
    return;
  }

  const role = await ensureSuperAdminRole();
  const passwordHash = await hashPassword(password);
  await prisma.adminUser.create({
    data: {
      email,
      passwordHash,
      roleId: role.id,
      name: defaultNameFromEmail(email),
    },
  });
  console.log("Created super admin:", email);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    void prisma.$disconnect();
    process.exit(1);
  });
