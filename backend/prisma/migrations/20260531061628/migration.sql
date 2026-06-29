-- CreateEnum
CREATE TYPE "SellerStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- AlterTable
ALTER TABLE "Seller" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "status" "SellerStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "SellerProfile" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "storeName" TEXT,
    "bio" TEXT,
    "city" TEXT,
    "avatarUrl" TEXT,
    "businessName" TEXT,
    "companyLogoUrl" TEXT,
    "companyDescription" TEXT,
    "tradeLicenseUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SellerProfile_sellerId_key" ON "SellerProfile"("sellerId");

-- CreateIndex
CREATE INDEX "Seller_email_idx" ON "Seller"("email");

-- CreateIndex
CREATE INDEX "Seller_sellerType_idx" ON "Seller"("sellerType");

-- CreateIndex
CREATE INDEX "Seller_status_idx" ON "Seller"("status");

-- AddForeignKey
ALTER TABLE "SellerProfile" ADD CONSTRAINT "SellerProfile_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE CASCADE ON UPDATE CASCADE;
