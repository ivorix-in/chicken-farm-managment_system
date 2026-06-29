import bcrypt from "bcryptjs";
import { prisma } from "../../../core/prisma.js";
import { AppError } from "../../../core/errors/AppError.js";
import type { Env } from "../../../core/env.js";
import { sendAdminPasswordResetOtpEmail } from "../../../core/email/mailer.js";
import {
  GENERIC_PASSWORD_RESET_REQUEST_MESSAGE,
  PASSWORD_RESET_OTP_BCRYPT_ROUNDS,
  PASSWORD_RESET_OTP_LENGTH,
  comparePassword,
  generateAdminAccessToken,
  generateAdminRefreshToken,
  hashAdminRefreshTokenForStorage,
  generateNumericOtp,
  hashPassword,
  normalizeEmail,
  verifyAdminRefreshToken,
} from "./adminAuth.helper.js";

const LOGIN_LOCK_THRESHOLD = 5;
const LOGIN_LOCK_MINUTES = 15;

function adminSessionAdminDto(adminUser: {
  id: string;
  email: string;
  name: string;
  mobileNumber: string | null;
  role: {
    id: string;
    name: string;
    code: string;
    permissions: unknown;
  };
}) {
  return {
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
    mobileNumber: adminUser.mobileNumber,
    role: {
      id: adminUser.role.id,
      name: adminUser.role.name,
      code: adminUser.role.code,
      permissions: adminUser.role.permissions,
    },
  };
}

export async function loginAdmin(
  env: Env,
  input: { email: string; password: string }
) {
  const now = new Date();
  const adminUser = await prisma.adminUser.findUnique({
    where: { email: normalizeEmail(input.email) },
    include: { role: true },
  });

  if (!adminUser || !adminUser.isActive || adminUser.deletedAt) {
    throw new AppError(401, "Invalid credentials");
  }
  if (adminUser.lockUntil && adminUser.lockUntil > now) {
    throw new AppError(423, "Account temporarily locked");
  }

  const ok = await comparePassword(input.password, adminUser.passwordHash);
  if (!ok) {
    const nextAttempts = adminUser.failedLoginAttempts + 1;
    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: {
        failedLoginAttempts: nextAttempts,
        lockUntil:
          nextAttempts >= LOGIN_LOCK_THRESHOLD
            ? new Date(Date.now() + LOGIN_LOCK_MINUTES * 60 * 1000)
            : adminUser.lockUntil,
      },
    });
    throw new AppError(401, "Invalid credentials");
  }

  const accessToken = generateAdminAccessToken(env, {
    sub: adminUser.id,
    email: adminUser.email,
    role: adminUser.role.code,
  });

  const {
    token: refreshToken,
    jti,
    expiresAt: refreshExpiresAt,
  } = generateAdminRefreshToken(env, { sub: adminUser.id });
  const refreshTokenHash = hashAdminRefreshTokenForStorage(refreshToken);
  await prisma.$transaction([
    prisma.adminUser.update({
      where: { id: adminUser.id },
      data: {
        failedLoginAttempts: 0,
        lockUntil: null,
        lastLoginAt: now,
      },
    }),
    prisma.adminRefreshToken.deleteMany({
      where: { adminUserId: adminUser.id },
    }),
    prisma.adminRefreshToken.create({
      data: {
        id: jti,
        tokenHash: refreshTokenHash,
        adminUserId: adminUser.id,
        expiresAt: refreshExpiresAt,
      },
    }),
  ]);

  return {
    accessToken,
    refreshToken,
    admin: adminSessionAdminDto(adminUser),
  };
}

/**
 * Rotates the refresh token and returns a new access + refresh pair. Revokes the presented
 * refresh token; if the DB row exists but the token hash does not match, all sessions for
 * that admin are cleared (possible token reuse/theft).
 */
export async function refreshAdminSession(
  env: Env,
  refreshTokenRaw: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  admin: ReturnType<typeof adminSessionAdminDto>;
}> {
  const invalid = () =>
    new AppError(401, "Invalid or expired refresh token", "REFRESH_INVALID");

  let payload: { sub: string; jti: string; typ: "admin_refresh" };
  try {
    payload = verifyAdminRefreshToken(env, refreshTokenRaw);
  } catch {
    throw invalid();
  }

  const presentedHash = hashAdminRefreshTokenForStorage(refreshTokenRaw);
  const row = await prisma.adminRefreshToken.findUnique({
    where: { id: payload.jti },
    include: {
      adminUser: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!row) {
    throw invalid();
  }

  if (row.tokenHash !== presentedHash) {
    await prisma.adminRefreshToken.updateMany({
      where: { adminUserId: row.adminUserId },
      data: { revokedAt: new Date() },
    });
    throw invalid();
  }

  if (row.revokedAt != null) {
    throw invalid();
  }

  if (row.expiresAt <= new Date()) {
    await prisma.adminRefreshToken.update({
      where: { id: row.id },
      data: { revokedAt: new Date() },
    });
    throw invalid();
  }

  if (row.adminUserId !== payload.sub) {
    throw invalid();
  }

  const adminUser = row.adminUser;
  if (
    !adminUser.isActive ||
    adminUser.deletedAt ||
    (adminUser.lockUntil != null && adminUser.lockUntil > new Date())
  ) {
    await prisma.adminRefreshToken.updateMany({
      where: { adminUserId: adminUser.id },
      data: { revokedAt: new Date() },
    });
    throw invalid();
  }

  const accessToken = generateAdminAccessToken(env, {
    sub: adminUser.id,
    email: adminUser.email,
    role: adminUser.role.code,
  });

  const {
    token: refreshToken,
    jti: newJti,
    expiresAt: refreshExpiresAt,
  } = generateAdminRefreshToken(env, { sub: adminUser.id });
  const newHash = hashAdminRefreshTokenForStorage(refreshToken);

  await prisma.$transaction([
    prisma.adminRefreshToken.update({
      where: { id: row.id },
      data: { revokedAt: new Date() },
    }),
    prisma.adminRefreshToken.create({
      data: {
        id: newJti,
        tokenHash: newHash,
        adminUserId: adminUser.id,
        expiresAt: refreshExpiresAt,
      },
    }),
  ]);

  return {
    accessToken,
    refreshToken,
    admin: adminSessionAdminDto(adminUser),
  };
}

async function enforceForgotPasswordMinDelay(env: Env, startedAt: number) {
  const elapsed = Date.now() - startedAt;
  const minMs = env.ADMIN_PASSWORD_RESET_FORGOT_MIN_DELAY_MS;
  if (elapsed < minMs) {
    await new Promise((r) => setTimeout(r, minMs - elapsed));
  }
}

/**
 * Requests a password reset OTP. Always returns the same message when the email is unknown
 * to avoid account enumeration; email is only sent for active, non-deleted admins.
 * Applies a minimum response delay to reduce timing-based existence leaks.
 */
export async function requestAdminPasswordReset(
  env: Env,
  input: { email: string }
): Promise<{ message: string }> {
  const startedAt = Date.now();
  try {
    const email = normalizeEmail(input.email);
    const adminUser = await prisma.adminUser.findFirst({
      where: { email, isActive: true, deletedAt: null },
    });

    if (!adminUser) {
      return { message: GENERIC_PASSWORD_RESET_REQUEST_MESSAGE };
    }

    const otp = generateNumericOtp(PASSWORD_RESET_OTP_LENGTH);
    const otpHash = await bcrypt.hash(otp, PASSWORD_RESET_OTP_BCRYPT_ROUNDS);
    const expiresAt = new Date(
      Date.now() + env.PASSWORD_RESET_OTP_TTL_MINUTES * 60 * 1000
    );

    await prisma.adminPasswordResetOtp.create({
      data: {
        userId: adminUser.id,
        otpHash,
        expiresAt,
      },
    });

    const appPublicUrl =
      env.APP_PUBLIC_URL && env.APP_PUBLIC_URL.length > 0
        ? env.APP_PUBLIC_URL
        : undefined;

    await sendAdminPasswordResetOtpEmail(env, {
      to: adminUser.email,
      appName: env.APP_NAME,
      userName: adminUser.name,
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
 * Completes password reset using the emailed OTP. Uses a constant error message on failure
 * so response bodies do not leak whether the email or code was wrong.
 */
export async function resetAdminPasswordWithOtp(
  env: Env,
  input: {
    email: string;
    otp: string;
    newPassword: string;
  }
): Promise<{ message: string }> {
  const email = normalizeEmail(input.email);
  const maxAttempts = env.ADMIN_PASSWORD_RESET_OTP_MAX_ATTEMPTS;
  const invalid = () =>
    new AppError(400, "Invalid or expired verification code", "RESET_INVALID");

  const adminUser = await prisma.adminUser.findFirst({
    where: { email, isActive: true, deletedAt: null },
  });
  if (!adminUser) {
    throw invalid();
  }

  const now = new Date();
  const otpRow = await prisma.adminPasswordResetOtp.findFirst({
    where: {
      userId: adminUser.id,
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
    await prisma.adminPasswordResetOtp.update({
      where: { id: otpRow.id },
      data: { attempts: { increment: 1 } },
    });
    throw invalid();
  }

  const passwordHash = await hashPassword(input.newPassword);

  await prisma.$transaction([
    prisma.adminUser.update({
      where: { id: adminUser.id },
      data: {
        passwordHash,
        failedLoginAttempts: 0,
        lockUntil: null,
      },
    }),
    prisma.adminPasswordResetOtp.update({
      where: { id: otpRow.id },
      data: { usedAt: now },
    }),
    prisma.adminRefreshToken.deleteMany({
      where: { adminUserId: adminUser.id },
    }),
  ]);

  return {
    message: "Password has been reset. You can sign in with your new password.",
  };
}

export async function getAdminMe(adminUserId: string) {
  const adminUser = await prisma.adminUser.findUnique({
    where: { id: adminUserId },
    include: {
      role: {
        select: {
          id: true,
          name: true,
          code: true,
          permissions: true,
        },
      },
    },
  });

  if (!adminUser || !adminUser.isActive || adminUser.deletedAt) {
    throw new AppError(403, "Company admin access required");
  }

  return {
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
    mobileNumber: adminUser.mobileNumber,
    role: adminUser.role,
  };
}
