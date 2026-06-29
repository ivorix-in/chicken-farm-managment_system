import bcrypt from "bcryptjs";
import { prisma } from "../../../core/prisma.js";
import { AppError } from "../../../core/errors/AppError.js";
import type { Env } from "../../../core/env.js";
import { hashPassword, normalizeEmail } from "./sellerAuth.helper.js";
import {
  generateNumericOtp,
  PASSWORD_RESET_OTP_BCRYPT_ROUNDS,
  PASSWORD_RESET_OTP_LENGTH,
} from "../../../core/auth/passwordReset.js";
import { sendSellerRegistrationOtpEmail } from "../../../core/email/mailer.js";

export async function registerSeller(
  env: Env,
  input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    country: string;
    sellerType: "INDIVIDUAL" | "BUSINESS";
  }
): Promise<{ message: string }> {
  const email = normalizeEmail(input.email);

  const existing = await prisma.seller.findUnique({ where: { email } });
  if (existing) {
    if (existing.isActive) {
      throw new AppError(409, "An account with this email already exists", "EMAIL_TAKEN");
    }
    // Account exists but not yet verified — resend OTP
    return sendRegistrationOtp(env, existing.id, email, input.firstName);
  }

  const phoneExists = await prisma.seller.findUnique({
    where: { phoneNumber: input.phoneNumber },
  });
  if (phoneExists) {
    throw new AppError(409, "This phone number is already registered", "PHONE_TAKEN");
  }

  const passwordHash = await hashPassword(input.password);

  const seller = await prisma.seller.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email,
      password: passwordHash,
      phoneNumber: input.phoneNumber,
      country: input.country,
      sellerType: input.sellerType,
      isActive: false,
      status: "PENDING",
      ...(input.sellerType === "BUSINESS" ? { businessProfile: { create: {} } } : { individualProfile: { create: {} } }),
    },
  });

  return sendRegistrationOtp(env, seller.id, email, input.firstName);
}

async function sendRegistrationOtp(
  env: Env,
  sellerId: string,
  email: string,
  firstName: string
): Promise<{ message: string }> {
  // Invalidate any existing unused OTPs
  await prisma.sellerPasswordResetOtp.updateMany({
    where: { sellerId, usedAt: null },
    data: { usedAt: new Date() },
  });

  const otp = generateNumericOtp(PASSWORD_RESET_OTP_LENGTH);
  const otpHash = await bcrypt.hash(otp, PASSWORD_RESET_OTP_BCRYPT_ROUNDS);
  const expiresAt = new Date(
    Date.now() + env.PASSWORD_RESET_OTP_TTL_MINUTES * 60 * 1000
  );

  await prisma.sellerPasswordResetOtp.create({
    data: { sellerId, otpHash, expiresAt },
  });

  await sendSellerRegistrationOtpEmail(env, {
    to: email,
    appName: env.APP_NAME,
    userName: firstName,
    otpCode: otp,
    expiresInMinutes: env.PASSWORD_RESET_OTP_TTL_MINUTES,
    appPublicUrl: env.SELLER_APP_PUBLIC_URL || undefined,
  });

  return {
    message: "A verification code has been sent to your email address.",
  };
}

export async function verifyRegistrationOtp(
  env: Env,
  input: { email: string; otp: string }
): Promise<{ message: string }> {
  const email = normalizeEmail(input.email);
  const maxAttempts = env.SELLER_PASSWORD_RESET_OTP_MAX_ATTEMPTS;
  const invalid = () =>
    new AppError(400, "Invalid or expired verification code", "OTP_INVALID");

  const seller = await prisma.seller.findUnique({ where: { email } });
  if (!seller) throw invalid();

  if (seller.isActive) {
    return { message: "Account already verified. You can sign in." };
  }

  const now = new Date();
  const otpRow = await prisma.sellerPasswordResetOtp.findFirst({
    where: { sellerId: seller.id, usedAt: null, expiresAt: { gt: now } },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRow || otpRow.attempts >= maxAttempts) throw invalid();

  const otpOk = await bcrypt.compare(input.otp, otpRow.otpHash);
  if (!otpOk) {
    await prisma.sellerPasswordResetOtp.update({
      where: { id: otpRow.id },
      data: { attempts: { increment: 1 } },
    });
    throw invalid();
  }

  await prisma.$transaction([
    prisma.seller.update({
      where: { id: seller.id },
      data: { isActive: true, status: "ACTIVE" },
    }),
    prisma.sellerPasswordResetOtp.update({
      where: { id: otpRow.id },
      data: { usedAt: now },
    }),
  ]);

  return { message: "Email verified successfully. You can now sign in." };
}

export async function resendRegistrationOtp(
  env: Env,
  input: { email: string }
): Promise<{ message: string }> {
  const email = normalizeEmail(input.email);
  const seller = await prisma.seller.findUnique({ where: { email } });

  // Always return same message to prevent enumeration
  if (!seller || seller.isActive) {
    return { message: "A verification code has been sent to your email address." };
  }

  return sendRegistrationOtp(env, seller.id, email, seller.firstName);
}
