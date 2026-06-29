-- Seller password reset OTP (isolated from admin password reset).

CREATE TABLE "SellerPasswordResetOtp" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SellerPasswordResetOtp_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SellerPasswordResetOtp_sellerId_idx" ON "SellerPasswordResetOtp"("sellerId");
CREATE INDEX "SellerPasswordResetOtp_expiresAt_idx" ON "SellerPasswordResetOtp"("expiresAt");

ALTER TABLE "SellerPasswordResetOtp" ADD CONSTRAINT "SellerPasswordResetOtp_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE CASCADE ON UPDATE CASCADE;
