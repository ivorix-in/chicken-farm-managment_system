/**
 * Pure seller-auth utilities: tokens, passwords, payloads.
 * No database, controllers, or business workflows.
 */
import jwt from "jsonwebtoken";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import { createHash, randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import type { Env } from "../../../core/env.js";

export type SellerAccessTokenPayload = {
  sub: string;
  email: string;
  role: string;
};

export type SellerRefreshTokenPayload = {
  sub: string;
  jti: string;
  typ: "seller_refresh";
};

export const LOGIN_PASSWORD_BCRYPT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, LOGIN_PASSWORD_BCRYPT_ROUNDS);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function getJwtRefreshSecret(env: Env): string {
  if (env.JWT_REFRESH_SECRET) return env.JWT_REFRESH_SECRET;
  if (env.NODE_ENV === "production") {
    throw new Error("JWT_REFRESH_SECRET is required in production");
  }
  return env.JWT_SECRET;
}

export function generateSellerAccessToken(
  env: Env,
  payload: SellerAccessTokenPayload
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

export function verifySellerAccessToken(
  env: Env,
  token: string
): SellerAccessTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload & {
      email?: string;
      role?: string;
    };
    if (!decoded.sub || !decoded.email || !decoded.role) {
      throw new Error("Access token payload is incomplete");
    }
    return {
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      throw new Error("Access token expired");
    }
    throw new Error("Invalid access token");
  }
}

export function generateSellerRefreshToken(
  env: Env,
  payload: Pick<SellerRefreshTokenPayload, "sub">
): { token: string; jti: string; expiresAt: Date } {
  const secret = getJwtRefreshSecret(env);
  const jti = randomUUID();
  const token = jwt.sign(
    { jti, typ: "seller_refresh" as const },
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

export function verifySellerRefreshToken(
  env: Env,
  token: string
): SellerRefreshTokenPayload {
  try {
    const secret = getJwtRefreshSecret(env);
    const decoded = jwt.verify(token, secret) as JwtPayload & {
      jti?: string;
      typ?: string;
    };
    if (!decoded.sub || decoded.typ !== "seller_refresh" || !decoded.jti) {
      throw new Error("Refresh token payload is incomplete");
    }
    return {
      sub: decoded.sub,
      jti: decoded.jti,
      typ: "seller_refresh",
    };
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      throw new Error("Refresh token expired");
    }
    throw new Error("Invalid refresh token");
  }
}

export function hashSellerRefreshTokenForStorage(rawToken: string): string {
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}
