import { Seller } from "../../seller/models/index.js";
import { AppError } from "../../../core/errors/AppError.js";
import { hashPassword, normalizeEmail } from "../Auth/adminAuth.helper.js";

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

export function serializeSeller(row: any): SellerApiShape {
  const { phoneCode, phoneNumber } = splitPhoneNumber(row.phoneNumber);
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    country: row.country,
    phoneCode,
    phoneNumber,
    sellerType: row.sellerType === "BUSINESS" ? "business" : "individual",
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listSellers() {
  const rows = await Seller.find().sort({ createdAt: "desc" });
  return rows.map(serializeSeller);
}

export async function getSellerById(sellerId: string) {
  const row = await Seller.findById(sellerId);
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
    Seller.findOne({ email }),
    Seller.findOne({ phoneNumber }),
  ]);

  if (emailTaken) {
    throw new AppError(409, "A seller with this email already exists");
  }
  if (phoneTaken) {
    throw new AppError(409, "A seller with this phone number already exists");
  }

  const passwordHash = await hashPassword(input.password);
  const sellerType = input.sellerType === "business" ? "BUSINESS" : "INDIVIDUAL";

  const row = await Seller.create({
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email,
    password: passwordHash,
    phoneNumber,
    country: input.country.trim(),
    sellerType,
    isActive: true,
    status: "ACTIVE",
    individualProfile: sellerType === "INDIVIDUAL" ? {} : null,
    businessProfile: sellerType === "BUSINESS" ? {} : null,
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
  const current = await Seller.findById(sellerId);
  if (!current) {
    throw new AppError(404, "Seller not found");
  }

  const email =
    input.email !== undefined ? normalizeEmail(input.email) : undefined;

  if (email !== undefined && email !== current.email) {
    const emailTaken = await Seller.findOne({
      email,
      _id: { $ne: sellerId },
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
      const phoneTaken = await Seller.findOne({
        phoneNumber,
        _id: { $ne: sellerId },
      });
      if (phoneTaken) {
        throw new AppError(409, "A seller with this phone number already exists");
      }
    }
  }

  const updateData: any = {};
  if (input.firstName !== undefined) updateData.firstName = input.firstName.trim();
  if (input.lastName !== undefined) updateData.lastName = input.lastName.trim();
  if (email !== undefined) updateData.email = email;
  if (input.country !== undefined) updateData.country = input.country.trim();
  if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
  if (input.sellerType !== undefined) {
    updateData.sellerType = input.sellerType === "business" ? "BUSINESS" : "INDIVIDUAL";
  }
  if (input.password !== undefined && input.password.length > 0) {
    updateData.password = await hashPassword(input.password);
  }

  const row = await Seller.findByIdAndUpdate(sellerId, updateData, { new: true });
  if (!row) {
    throw new AppError(404, "Seller not found");
  }

  return serializeSeller(row);
}

export async function deleteSeller(sellerId: string) {
  const current = await Seller.findById(sellerId);
  if (!current) {
    throw new AppError(404, "Seller not found");
  }
  await Seller.findByIdAndDelete(sellerId);
}
