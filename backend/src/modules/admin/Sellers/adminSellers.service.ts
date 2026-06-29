import type { Seller, SellerType as PrismaSellerType } from "@prisma/client";
import { prisma } from "../../../core/prisma.js";
import { AppError } from "../../../core/errors/AppError.js";
import {
  hashPassword,
  normalizeEmail,
} from "../Auth/adminAuth.helper.js";

/** Dial codes used when splitting stored phone numbers for the admin UI. */
const KNOWN_PHONE_CODES = [
  "+91",
  "+81",
  "+61",
  "+49",
  "+44",
  "+33",
  "+1",
] as const;

export type SellerApiShape = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  phoneCode: string;
  phoneNumber: string;
  sellerType: "individual" | "business";
  createdAt: string;
  updatedAt: string;
};

function toPrismaSellerType(type: "individual" | "business"): PrismaSellerType {
  return type === "business" ? "BUSINESS" : "INDIVIDUAL";
}

function fromPrismaSellerType(type: PrismaSellerType): "individual" | "business" {
  return type === "BUSINESS" ? "business" : "individual";
}

export function buildFullPhoneNumber(phoneCode: string, localNumber: string): string {
  const code = phoneCode.trim();
  const digits = localNumber.replace(/\D/gu, "");
  if (!code.startsWith("+")) {
    throw new AppError(400, "Phone code must start with +");
  }
  return `${code}${digits}`;
}

export function splitPhoneNumber(full: string): {
  phoneCode: string;
  phoneNumber: string;
} {
  const normalized = full.trim();
  const sorted = [...KNOWN_PHONE_CODES].sort((a, b) => b.length - a.length);
  for (const code of sorted) {
    if (normalized.startsWith(code)) {
      return {
        phoneCode: code,
        phoneNumber: normalized.slice(code.length),
      };
    }
  }
  return { phoneCode: "+1", phoneNumber: normalized.replace(/^\+/u, "") };
}

export function serializeSeller(row: Seller): SellerApiShape {
  const { phoneCode, phoneNumber } = splitPhoneNumber(row.phoneNumber);
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    country: row.country,
    phoneCode,
    phoneNumber,
    sellerType: fromPrismaSellerType(row.sellerType),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listSellers() {
  const rows = await prisma.seller.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(serializeSeller);
}

export async function getSellerById(sellerId: string) {
  const row = await prisma.seller.findUnique({ where: { id: sellerId } });
  if (!row) {
    throw new AppError(404, "Seller not found");
  }
  return serializeSeller(row);
}

export async function createSeller(input: {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  phoneCode: string;
  phoneNumber: string;
  password: string;
  sellerType: "individual" | "business";
}) {
  const email = normalizeEmail(input.email);
  const phoneNumber = buildFullPhoneNumber(input.phoneCode, input.phoneNumber);

  const [emailTaken, phoneTaken] = await Promise.all([
    prisma.seller.findUnique({ where: { email } }),
    prisma.seller.findUnique({ where: { phoneNumber } }),
  ]);

  if (emailTaken) {
    throw new AppError(409, "A seller with this email already exists");
  }
  if (phoneTaken) {
    throw new AppError(409, "A seller with this phone number already exists");
  }

  const passwordHash = await hashPassword(input.password);

  const row = await prisma.seller.create({
    data: {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email,
      password: passwordHash,
      phoneNumber,
      country: input.country.trim(),
      sellerType: toPrismaSellerType(input.sellerType),
    },
  });

  return serializeSeller(row);
}

export async function updateSeller(
  sellerId: string,
  input: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    country: string;
    phoneCode: string;
    phoneNumber: string;
    password: string;
    sellerType: "individual" | "business";
  }>
) {
  const current = await prisma.seller.findUnique({ where: { id: sellerId } });
  if (!current) {
    throw new AppError(404, "Seller not found");
  }

  const email =
    input.email !== undefined ? normalizeEmail(input.email) : undefined;

  if (email !== undefined && email !== current.email) {
    const emailTaken = await prisma.seller.findFirst({
      where: { email, NOT: { id: sellerId } },
    });
    if (emailTaken) {
      throw new AppError(409, "A seller with this email already exists");
    }
  }

  let phoneNumber: string | undefined;
  if (input.phoneCode !== undefined || input.phoneNumber !== undefined) {
    const { phoneCode, phoneNumber: local } = splitPhoneNumber(current.phoneNumber);
    phoneNumber = buildFullPhoneNumber(
      input.phoneCode ?? phoneCode,
      input.phoneNumber ?? local
    );
    if (phoneNumber !== current.phoneNumber) {
      const phoneTaken = await prisma.seller.findFirst({
        where: { phoneNumber, NOT: { id: sellerId } },
      });
      if (phoneTaken) {
        throw new AppError(409, "A seller with this phone number already exists");
      }
    }
  }

  const data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    country?: string;
    phoneNumber?: string;
    password?: string;
    sellerType?: PrismaSellerType;
  } = {};

  if (input.firstName !== undefined) data.firstName = input.firstName.trim();
  if (input.lastName !== undefined) data.lastName = input.lastName.trim();
  if (email !== undefined) data.email = email;
  if (input.country !== undefined) data.country = input.country.trim();
  if (phoneNumber !== undefined) data.phoneNumber = phoneNumber;
  if (input.sellerType !== undefined) {
    data.sellerType = toPrismaSellerType(input.sellerType);
  }
  if (input.password !== undefined && input.password.length > 0) {
    data.password = await hashPassword(input.password);
  }

  const row = await prisma.seller.update({
    where: { id: sellerId },
    data,
  });

  return serializeSeller(row);
}

export async function deleteSeller(sellerId: string) {
  const current = await prisma.seller.findUnique({ where: { id: sellerId } });
  if (!current) {
    throw new AppError(404, "Seller not found");
  }
  await prisma.seller.delete({ where: { id: sellerId } });
}
