-- Align Seller with prisma/schema.prisma (enum SellerType on Seller row).

DROP TABLE IF EXISTS "Seller";
DROP TABLE IF EXISTS "SellerType";

CREATE TYPE "SellerType" AS ENUM ('BUSINESS', 'INDIVIDUAL');

CREATE TABLE "Seller" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "sellerType" "SellerType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Seller_email_key" ON "Seller"("email");
CREATE UNIQUE INDEX "Seller_phoneNumber_key" ON "Seller"("phoneNumber");
