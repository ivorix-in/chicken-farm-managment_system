/*
  Warnings:

  - You are about to drop the column `userType` on the `AdminUser` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "AdminUser_mobileNumber_key";

-- AlterTable
ALTER TABLE "AdminUser" DROP COLUMN "userType",
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- DropEnum
DROP TYPE "UserRole";

-- DropEnum
DROP TYPE "UserType";

-- CreateIndex
CREATE INDEX "AdminUser_roleId_idx" ON "AdminUser"("roleId");
