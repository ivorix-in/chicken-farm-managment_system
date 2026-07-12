import "dotenv/config";
import mongoose from "mongoose";
import { AdminRole, AdminUser } from "../modules/admin/models/index.js";
import { hashPassword, normalizeEmail } from "../modules/admin/Auth/adminAuth.helper.js";

function defaultNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "admin";
  const cleaned = local.replace(/[._-]+/g, " ").trim();
  if (!cleaned) return "Admin";
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
}

async function ensureSuperAdminRole() {
  let role = await AdminRole.findOne({ code: "SUPER_ADMIN" });
  if (!role) {
    role = await AdminRole.create({
      name: "Super Admin",
      code: "SUPER_ADMIN",
      permissions: ["*"],
    });
  }
  return role;
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL env variable not defined.");
    process.exit(1);
  }
  await mongoose.connect(dbUrl);

  const email = normalizeEmail(process.env.SEED_SUPER_ADMIN_EMAIL ?? "");
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("Skip seed: set SEED_SUPER_ADMIN_EMAIL and SEED_SUPER_ADMIN_PASSWORD to create super admin.");
    return;
  }

  const existing = await AdminUser.findOne({ email });
  if (existing) {
    console.log("Skip seed: admin user already exists", email);
    return;
  }

  const role = await ensureSuperAdminRole();
  const passwordHash = await hashPassword(password);
  await AdminUser.create({
    email,
    passwordHash,
    roleId: role.id,
    name: defaultNameFromEmail(email),
  });
  console.log("Created super admin:", email);
}

main()
  .then(() => mongoose.disconnect())
  .catch((e) => {
    console.error(e);
    void mongoose.disconnect();
    process.exit(1);
  });
