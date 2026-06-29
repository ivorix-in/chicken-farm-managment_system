-- CreateTable
CREATE TABLE "AdminPasswordResetOtp" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminPasswordResetOtp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminPasswordResetOtp_adminUserId_idx" ON "AdminPasswordResetOtp"("adminUserId");

-- CreateIndex
CREATE INDEX "AdminPasswordResetOtp_expiresAt_idx" ON "AdminPasswordResetOtp"("expiresAt");

-- AddForeignKey
ALTER TABLE "AdminPasswordResetOtp" ADD CONSTRAINT "AdminPasswordResetOtp_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
