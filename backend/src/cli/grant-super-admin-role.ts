/**
 * Ensures the SUPER_ADMIN role exists and grants full permission wildcard ["*"] (matches `hasPermission` in adminAuth.helper).
 * Safe to run repeatedly.
 *
 * Usage: npm run admin:super-role
 */
import "dotenv/config";
import mongoose from "mongoose";
import { AdminRole } from "../modules/admin/models/index.js";

const SUPER_ADMIN_CODE = "SUPER_ADMIN";
const FULL_PERMISSIONS = ["*"] as const;

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL env variable not defined.");
    process.exit(1);
  }
  await mongoose.connect(dbUrl);

  const existing = await AdminRole.findOne({ code: SUPER_ADMIN_CODE });

  if (!existing) {
    const created = await AdminRole.create({
      name: "Super Admin",
      code: SUPER_ADMIN_CODE,
      permissions: [...FULL_PERMISSIONS],
    });
    console.log(
      `Created role ${SUPER_ADMIN_CODE} (${created.id}) with permissions ${JSON.stringify(FULL_PERMISSIONS)}.`
    );
    return;
  }

  await AdminRole.findByIdAndUpdate(existing.id, {
    permissions: [...FULL_PERMISSIONS],
  });
  console.log(
    `Updated role ${SUPER_ADMIN_CODE} (${existing.id}): permissions set to ${JSON.stringify(FULL_PERMISSIONS)}.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
