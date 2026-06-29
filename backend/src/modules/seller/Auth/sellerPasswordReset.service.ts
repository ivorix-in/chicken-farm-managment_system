import bcrypt from "bcryptjs";
import { prisma } from "../../../core/prisma.js";
import { AppError } from "../../../core/errors/AppError.js";
import type { Env } from "../../../core/env.js";
import { sendSellerPasswordResetOtpEmail } from "../../../core/email/mailer.js";
import {
  GENERIC_PASSWORD_RESET_REQUEST_MESSAGE,
  PASSWORD_RESET_OTP_BCRYPT_ROUNDS,
  PASSWORD_RESET_OTP_LENGTH,
  enforcePasswordResetMinDelay,
  generateNumericOtp,
} from "../../../core/auth/passwordReset.js";
import { hashPassword, normalizeEmail } from "./sellerAuth.helper.js";

async function enforceForgotPasswordMinDelay(env: Env, startedAt: number) {
  await enforcePasswordResetMinDelay(
    env.SELLER_PASSWORD_RESET_FORGOT_MIN_DELAY_MS,
    startedAt
  );
}

/**
 * Requests a password reset OTP for a seller. Always returns the same message when the
 * email is unknown to avoid account enumeration.
 */
export async function requestSellerPasswordReset(
  env: Env,
  input: { email: string }
): Promise<{ message: string }> {
  const startedAt = Date.now();
  try {
    const email = normalizeEmail(input.email);
    const seller = await prisma.seller.findUnique({
      where: { email },
    });

    if (!seller) {
      return { message: GENERIC_PASSWORD_RESET_REQUEST_MESSAGE };
    }

    const otp = generateNumericOtp(PASSWORD_RESET_OTP_LENGTH);
    const otpHash = await bcrypt.hash(otp, PASSWORD_RESET_OTP_BCRYPT_ROUNDS);
    const expiresAt = new Date(
      Date.now() + env.PASSWORD_RESET_OTP_TTL_MINUTES * 60 * 1000
    );

    await prisma.sellerPasswordResetOtp.create({
      data: {
        sellerId: seller.id,
        otpHash,
        expiresAt,
      },
    });

    const appPublicUrl =
      env.SELLER_APP_PUBLIC_URL && env.SELLER_APP_PUBLIC_URL.length > 0
        ? env.SELLER_APP_PUBLIC_URL
        : undefined;

    const userName = `${seller.firstName} ${seller.lastName}`.trim();

    await sendSellerPasswordResetOtpEmail(env, {
      to: seller.email,
      appName: env.APP_NAME,
      userName: userName || seller.email,
      otpCode: otp,
      expiresInMinutes: env.PASSWORD_RESET_OTP_TTL_MINUTES,
      appPublicUrl,
    });

    return { message: GENERIC_PASSWORD_RESET_REQUEST_MESSAGE };
  } finally {
    await enforceForgotPasswordMinDelay(env, startedAt);
  }
}

/**
 * Verifies seller password reset OTP without marking it as used.
 */
export async function verifySellerPasswordResetOtp(
  env: Env,
  input: {
    email: string;
    otp: string;
  }
): Promise<{ message: string }> {
  const email = normalizeEmail(input.email);
  const maxAttempts = env.SELLER_PASSWORD_RESET_OTP_MAX_ATTEMPTS;
  const invalid = () =>
    new AppError(400, "Invalid or expired verification code", "RESET_INVALID");

  const seller = await prisma.seller.findUnique({
    where: { email },
  });
  if (!seller) {
    throw invalid();
  }

  const now = new Date();
  const otpRow = await prisma.sellerPasswordResetOtp.findFirst({
    where: {
      sellerId: seller.id,
      usedAt: null,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRow || otpRow.attempts >= maxAttempts) {
    throw invalid();
  }

  const otpOk = await bcrypt.compare(input.otp, otpRow.otpHash);
  if (!otpOk) {
    await prisma.sellerPasswordResetOtp.update({
      where: { id: otpRow.id },
      data: { attempts: { increment: 1 } },
    });
    throw invalid();
  }

  return { message: "OTP verified successfully" };
}

/**
 * Completes seller password reset using the emailed OTP.
 */
export async function resetSellerPasswordWithOtp(
  env: Env,
  input: {
    email: string;
    otp: string;
    newPassword: string;
  }
): Promise<{ message: string }> {
  const email = normalizeEmail(input.email);
  const maxAttempts = env.SELLER_PASSWORD_RESET_OTP_MAX_ATTEMPTS;
  const invalid = () =>
    new AppError(400, "Invalid or expired verification code", "RESET_INVALID");

  const seller = await prisma.seller.findUnique({
    where: { email },
  });
  if (!seller) {
    throw invalid();
  }

  const now = new Date();
  const otpRow = await prisma.sellerPasswordResetOtp.findFirst({
    where: {
      sellerId: seller.id,
      usedAt: null,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRow || otpRow.attempts >= maxAttempts) {
    throw invalid();
  }

  const otpOk = await bcrypt.compare(input.otp, otpRow.otpHash);
  if (!otpOk) {
    await prisma.sellerPasswordResetOtp.update({
      where: { id: otpRow.id },
      data: { attempts: { increment: 1 } },
    });
    throw invalid();
  }

  const password = await hashPassword(input.newPassword);

  await prisma.$transaction([
    prisma.seller.update({
      where: { id: seller.id },
      data: { password },
    }),
    prisma.sellerPasswordResetOtp.update({
      where: { id: otpRow.id },
      data: { usedAt: now },
    }),
  ]);

  return {
    message: "Password has been reset. You can sign in with your new password.",
  };
}
