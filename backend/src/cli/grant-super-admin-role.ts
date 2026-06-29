/**
 * Ensures the SUPER_ADMIN role exists and grants full permission wildcard ["*"] (matches `hasPermission` in adminAuth.helper).
 * Safe to run repeatedly.
 *
 * Usage: npm run admin:super-role
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SUPER_ADMIN_CODE = "SUPER_ADMIN";
const FULL_PERMISSIONS = ["*"] as const;

async function main() {
  const existing = await prisma.adminRole.findUnique({
    where: { code: SUPER_ADMIN_CODE },
  });

  if (!existing) {
    const created = await prisma.adminRole.create({
      data: {
        name: "Super Admin",
        code: SUPER_ADMIN_CODE,
        permissions: [...FULL_PERMISSIONS],
      },
    });
    console.log(
      `Created role ${SUPER_ADMIN_CODE} (${created.id}) with permissions ${JSON.stringify(FULL_PERMISSIONS)}.`
    );
    return;
  }

  await prisma.adminRole.update({
    where: { id: existing.id },
    data: {
      permissions: [...FULL_PERMISSIONS],
    },
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
    await prisma.$disconnect();
  });
