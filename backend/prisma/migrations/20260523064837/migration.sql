/*
  Warnings:

  - You are about to drop the column `passwordResetOtpAttempts` on the `AdminUser` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetOtpExpiresAt` on the `AdminUser` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetOtpHash` on the `AdminUser` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetOtpUsedAt` on the `AdminUser` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mobileNumber]` on the table `AdminUser` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX IF EXISTS "AdminUser_email_idx";

-- AlterTable
ALTER TABLE "AdminRefreshToken" ADD COLUMN     "revokedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "AdminUser" DROP COLUMN "passwordResetOtpAttempts",
DROP COLUMN "passwordResetOtpExpiresAt",
DROP COLUMN "passwordResetOtpHash",
DROP COLUMN "passwordResetOtpUsedAt",
ADD COLUMN     "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "lockUntil" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "AdminPasswordResetOtp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminPasswordResetOtp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminPasswordResetOtp_userId_idx" ON "AdminPasswordResetOtp"("userId");

-- CreateIndex
CREATE INDEX "AdminPasswordResetOtp_expiresAt_idx" ON "AdminPasswordResetOtp"("expiresAt");

-- CreateIndex
CREATE INDEX "AdminRefreshToken_expiresAt_idx" ON "AdminRefreshToken"("expiresAt");

-- CreateIndex
CREATE INDEX "AdminRole_code_idx" ON "AdminRole"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_mobileNumber_key" ON "AdminUser"("mobileNumber");

-- CreateIndex
CREATE INDEX "AdminUser_isActive_idx" ON "AdminUser"("isActive");

-- AddForeignKey
ALTER TABLE "AdminPasswordResetOtp" ADD CONSTRAINT "AdminPasswordResetOtp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
