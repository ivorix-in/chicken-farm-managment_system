/**
 * Pure admin-auth utilities: tokens, passwords, permissions, cookies, OTP helpers.
 * No database, HTTP controllers, or business workflows.
 */
import jwt from "jsonwebtoken";
import type { JwtPayload, SignOptions } from "jsonwebtoken";

const { JsonWebTokenError, TokenExpiredError } = jwt;
import { createHash, randomInt, randomUUID } from "node:crypto";
import type { CookieOptions, Response } from "express";
import bcrypt from "bcryptjs";
import type { Env } from "../../../core/env.js";

// --- Types ------------------------------------------------------------------

export type AdminAccessTokenPayload = {
  sub: string;
  email: string;
  role: string;
};

export type AdminRefreshTokenPayload = {
  sub: string;
  jti: string;
  typ: "admin_refresh";
};

export type AdminModelForAuthPayload = {
  id: string;
  role: {
    code: string;
    permissions: unknown;
  };
};

/** Returned for API/session use (not necessarily equal to JWT claims). */
export type AdminAuthPayload = {
  id: string;
  role: string;
  permissions: unknown;
};

export type AdminForPermissionCheck = {
  role: {
    permissions: unknown;
  };
};

export type AdminAuthCookieTokens = {
  accessToken: string;
  refreshToken: string;
};

// --- Errors -----------------------------------------------------------------

export class AdminAuthTokenError extends Error {
  constructor(
    message: string,
    public readonly code: "expired" | "invalid" | "malformed"
  ) {
    super(message);
    this.name = "AdminAuthTokenError";
  }
}

// --- Env --------------------------------------------------------------------

export function getJwtRefreshSecret(env: Env): string {
  if (env.JWT_REFRESH_SECRET) return env.JWT_REFRESH_SECRET;
  if (env.NODE_ENV === "production") {
    throw new Error("JWT_REFRESH_SECRET is required in production");
  }
  return env.JWT_SECRET;
}

// --- Permissions ------------------------------------------------------------

function normalizePermissionSet(permissions: unknown): Set<string> {
  if (permissions == null) return new Set();
  if (Array.isArray(permissions)) {
    return new Set(
      permissions.filter((x): x is string => typeof x === "string")
    );
  }
  if (typeof permissions === "object") {
    const set = new Set<string>();
    for (const [key, val] of Object.entries(
      permissions as Record<string, unknown>
    )) {
      if (val === true) set.add(key);
      else if (Array.isArray(val)) {
        for (const item of val) {
          if (typeof item === "string") set.add(`${key}:${item}`);
        }
      } else if (typeof val === "object" && val !== null) {
        for (const [k2, v2] of Object.entries(val as Record<string, unknown>)) {
          if (v2 === true) set.add(`${key}.${k2}`);
        }
      }
    }
    return set;
  }
  return new Set();
}

export function hasPermission(
  admin: AdminForPermissionCheck,
  permission: string
): boolean {
  const set = normalizePermissionSet(admin.role.permissions);
  if (set.has("*")) return true;
  return set.has(permission);
}

export function hasAnyPermission(
  admin: AdminForPermissionCheck,
  permissions: string[]
): boolean {
  return permissions.some((p) => hasPermission(admin, p));
}

// --- Auth payload -----------------------------------------------------------

export function buildAdminAuthPayload(
  admin: AdminModelForAuthPayload
): AdminAuthPayload {
  return {
    id: admin.id,
    role: admin.role.code,
    permissions: admin.role.permissions,
  };
}

// --- Password ---------------------------------------------------------------

export const PASSWORD_RESET_OTP_LENGTH = 6;
export const PASSWORD_RESET_OTP_BCRYPT_ROUNDS = 12;
export const LOGIN_PASSWORD_BCRYPT_ROUNDS = 10;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, LOGIN_PASSWORD_BCRYPT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateNumericOtp(length: number): string {
  const max = 10 ** length;
  return String(randomInt(0, max)).padStart(length, "0");
}

export const GENERIC_PASSWORD_RESET_REQUEST_MESSAGE =
  "If an account exists for this email, a verification code has been sent.";

/** Store a one-way hash of the raw refresh JWT so a DB leak cannot replay sessions. */
export function hashAdminRefreshTokenForStorage(rawToken: string): string {
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}

// --- JWT: access ------------------------------------------------------------

export function generateAdminAccessToken(
  env: Env,
  payload: AdminAccessTokenPayload
): string {
  return jwt.sign(
    { email: payload.email, role: payload.role },
    env.JWT_SECRET,
    {
      subject: payload.sub,
      expiresIn: env.JWT_EXPIRES_IN,
    } as SignOptions
  );
}

export function verifyAdminAccessToken(
  env: Env,
  token: string
): AdminAccessTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload & {
      email?: string;
      role?: string;
    };
    if (!decoded.sub || !decoded.email || !decoded.role) {
      throw new AdminAuthTokenError(
        "Access token payload is incomplete",
        "malformed"
      );
    }
    return {
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (e) {
    if (e instanceof AdminAuthTokenError) throw e;
    if (e instanceof TokenExpiredError) {
      throw new AdminAuthTokenError("Access token expired", "expired");
    }
    if (e instanceof JsonWebTokenError) {
      throw new AdminAuthTokenError("Invalid access token", "invalid");
    }
    throw new AdminAuthTokenError("Invalid access token", "invalid");
  }
}

// --- JWT: refresh -----------------------------------------------------------

export function generateAdminRefreshToken(
  env: Env,
  payload: Pick<AdminRefreshTokenPayload, "sub">
): { token: string; jti: string; expiresAt: Date } {
  const secret = getJwtRefreshSecret(env);
  const jti = randomUUID();
  const token = jwt.sign(
    { jti, typ: "admin_refresh" as const },
    secret,
    {
      subject: payload.sub,
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    } as SignOptions
  );
  const decoded = jwt.decode(token) as JwtPayload;
  const expSec = decoded.exp;
  if (typeof expSec !== "number") {
    throw new Error("Refresh token JWT missing exp");
  }
  return { token, jti, expiresAt: new Date(expSec * 1000) };
}

export function verifyAdminRefreshToken(
  env: Env,
  token: string
): AdminRefreshTokenPayload {
  try {
    const secret = getJwtRefreshSecret(env);
    const decoded = jwt.verify(token, secret) as JwtPayload & {
      jti?: string;
      typ?: string;
    };
    if (!decoded.sub || decoded.typ !== "admin_refresh" || !decoded.jti) {
      throw new AdminAuthTokenError(
        "Refresh token payload is incomplete",
        "malformed"
      );
    }
    return {
      sub: decoded.sub,
      jti: decoded.jti,
      typ: "admin_refresh",
    };
  } catch (e) {
    if (e instanceof AdminAuthTokenError) throw e;
    if (e instanceof TokenExpiredError) {
      throw new AdminAuthTokenError("Refresh token expired", "expired");
    }
    if (e instanceof JsonWebTokenError) {
      throw new AdminAuthTokenError("Invalid refresh token", "invalid");
    }
    throw new AdminAuthTokenError("Invalid refresh token", "invalid");
  }
}

// --- Cookies (Express) ------------------------------------------------------

function baseCookieOptions(env: Env): Pick<
  CookieOptions,
  "httpOnly" | "secure" | "sameSite" | "path" | "domain"
> {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(env.ADMIN_COOKIE_DOMAIN
      ? { domain: env.ADMIN_COOKIE_DOMAIN }
      : {}),
  };
}

export function setAuthCookies(
  res: Response,
  tokens: AdminAuthCookieTokens,
  env: Env
): void {
  const base = baseCookieOptions(env);
  res.cookie(env.ADMIN_ACCESS_COOKIE_NAME, tokens.accessToken, {
    ...base,
    maxAge: env.ADMIN_ACCESS_COOKIE_MAX_AGE_MS,
  });
  res.cookie(env.ADMIN_REFRESH_COOKIE_NAME, tokens.refreshToken, {
    ...base,
    maxAge: env.ADMIN_REFRESH_COOKIE_MAX_AGE_MS,
  });
}

export function clearAuthCookies(res: Response, env: Env): void {
  const base = baseCookieOptions(env);
  res.clearCookie(env.ADMIN_ACCESS_COOKIE_NAME, { ...base });
  res.clearCookie(env.ADMIN_REFRESH_COOKIE_NAME, { ...base });
}
