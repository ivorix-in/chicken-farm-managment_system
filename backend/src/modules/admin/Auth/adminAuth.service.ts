import bcrypt from "bcryptjs";
import {
  AdminUser,
  AdminRefreshToken,
  AdminPasswordResetOtp,
} from "../models/index.js";
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

function adminSessionAdminDto(adminUser: any) {
  return {
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
    mobileNumber: adminUser.mobileNumber ?? null,
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
  const adminUser = await AdminUser.findOne({
    email: normalizeEmail(input.email),
  }).populate("role");

  if (!adminUser || !adminUser.isActive || adminUser.deletedAt) {
    throw new AppError(401, "Invalid credentials");
  }
  if (adminUser.lockUntil && adminUser.lockUntil > now) {
    throw new AppError(423, "Account temporarily locked");
  }

  const ok = await comparePassword(input.password, adminUser.passwordHash);
  if (!ok) {
    const nextAttempts = adminUser.failedLoginAttempts + 1;
    await AdminUser.findByIdAndUpdate(adminUser.id, {
      failedLoginAttempts: nextAttempts,
      lockUntil:
        nextAttempts >= LOGIN_LOCK_THRESHOLD
          ? new Date(Date.now() + LOGIN_LOCK_MINUTES * 60 * 1000)
          : adminUser.lockUntil,
    });
    throw new AppError(401, "Invalid credentials");
  }

  const roleObj = adminUser.role as any;
  if (!roleObj) {
    throw new AppError(500, "User role not found");
  }

  const accessToken = generateAdminAccessToken(env, {
    sub: adminUser.id,
    email: adminUser.email,
    role: roleObj.code,
  });

  const {
    token: refreshToken,
    jti,
    expiresAt: refreshExpiresAt,
  } = generateAdminRefreshToken(env, { sub: adminUser.id });
  const refreshTokenHash = hashAdminRefreshTokenForStorage(refreshToken);

  // Perform updates sequentially
  await AdminUser.findByIdAndUpdate(adminUser.id, {
    failedLoginAttempts: 0,
    lockUntil: null,
    lastLoginAt: now,
  });
  await AdminRefreshToken.deleteMany({ adminUserId: adminUser.id });
  await AdminRefreshToken.create({
    _id: jti,
    tokenHash: refreshTokenHash,
    adminUserId: adminUser.id,
    expiresAt: refreshExpiresAt,
  });

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
  const row = await AdminRefreshToken.findById(payload.jti);

  if (!row) {
    throw invalid();
  }

  const adminUser = await AdminUser.findById(row.adminUserId).populate("role");
  if (!adminUser) {
    throw invalid();
  }

  if (row.tokenHash !== presentedHash) {
    await AdminRefreshToken.updateMany(
      { adminUserId: row.adminUserId },
      { revokedAt: new Date() }
    );
    throw invalid();
  }

  if (row.revokedAt != null) {
    throw invalid();
  }

  if (row.expiresAt <= new Date()) {
    await AdminRefreshToken.findByIdAndUpdate(row.id, { revokedAt: new Date() });
    throw invalid();
  }

  if (row.adminUserId !== payload.sub) {
    throw invalid();
  }

  if (
    !adminUser.isActive ||
    adminUser.deletedAt ||
    (adminUser.lockUntil != null && adminUser.lockUntil > new Date())
  ) {
    await AdminRefreshToken.updateMany(
      { adminUserId: adminUser.id },
      { revokedAt: new Date() }
    );
    throw invalid();
  }

  const roleObj = adminUser.role as any;
  if (!roleObj) {
    throw invalid();
  }

  const accessToken = generateAdminAccessToken(env, {
    sub: adminUser.id,
    email: adminUser.email,
    role: roleObj.code,
  });

  const {
    token: refreshToken,
    jti: newJti,
    expiresAt: refreshExpiresAt,
  } = generateAdminRefreshToken(env, { sub: adminUser.id });
  const newHash = hashAdminRefreshTokenForStorage(refreshToken);

  // Perform updates sequentially
  await AdminRefreshToken.findByIdAndUpdate(row.id, { revokedAt: new Date() });
  await AdminRefreshToken.create({
    _id: newJti,
    tokenHash: newHash,
    adminUserId: adminUser.id,
    expiresAt: refreshExpiresAt,
  });

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
    const adminUser = await AdminUser.findOne({
      email,
      isActive: true,
      deletedAt: null,
    });

    if (!adminUser) {
      return { message: GENERIC_PASSWORD_RESET_REQUEST_MESSAGE };
    }

    const otp = generateNumericOtp(PASSWORD_RESET_OTP_LENGTH);
    const otpHash = await bcrypt.hash(otp, PASSWORD_RESET_OTP_BCRYPT_ROUNDS);
    const expiresAt = new Date(
      Date.now() + env.PASSWORD_RESET_OTP_TTL_MINUTES * 60 * 1000
    );

    await AdminPasswordResetOtp.create({
      userId: adminUser.id,
      otpHash,
      expiresAt,
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

  const adminUser = await AdminUser.findOne({
    email,
    isActive: true,
    deletedAt: null,
  });
  if (!adminUser) {
    throw invalid();
  }

  const now = new Date();
  const otpRow = await AdminPasswordResetOtp.findOne({
    userId: adminUser.id,
    usedAt: null,
    expiresAt: { $gt: now },
  }).sort({ createdAt: -1 });

  if (!otpRow || otpRow.attempts >= maxAttempts) {
    throw invalid();
  }

  const otpOk = await bcrypt.compare(input.otp, otpRow.otpHash);
  if (!otpOk) {
    await AdminPasswordResetOtp.findByIdAndUpdate(otpRow.id, {
      $inc: { attempts: 1 },
    });
    throw invalid();
  }

  const passwordHash = await hashPassword(input.newPassword);

  // Perform updates sequentially
  await AdminUser.findByIdAndUpdate(adminUser.id, {
    passwordHash,
    failedLoginAttempts: 0,
    lockUntil: null,
  });
  await AdminPasswordResetOtp.findByIdAndUpdate(otpRow.id, {
    usedAt: now,
  });
  await AdminRefreshToken.deleteMany({ adminUserId: adminUser.id });

  return {
    message: "Password has been reset. You can sign in with your new password.",
  };
}

export async function getAdminMe(adminUserId: string) {
  const adminUser = await AdminUser.findById(adminUserId).populate("role");

  if (!adminUser || !adminUser.isActive || adminUser.deletedAt) {
    throw new AppError(403, "Company admin access required");
  }

  const roleObj = adminUser.role as any;
  return {
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
    mobileNumber: adminUser.mobileNumber ?? null,
    role: {
      id: roleObj.id,
      name: roleObj.name,
      code: roleObj.code,
      permissions: roleObj.permissions,
    },
  };
}
