-- DropTable
DROP TABLE IF EXISTS "AdminPasswordResetOtp";

-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN "passwordResetOtpHash" TEXT;
ALTER TABLE "AdminUser" ADD COLUMN "passwordResetOtpExpiresAt" TIMESTAMP(3);
ALTER TABLE "AdminUser" ADD COLUMN "passwordResetOtpUsedAt" TIMESTAMP(3);
