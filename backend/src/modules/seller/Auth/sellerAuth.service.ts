import { Seller } from "../models/index.js";
import { AppError } from "../../../core/errors/AppError.js";
import type { Env } from "../../../core/env.js";
import {
  comparePassword,
  generateSellerAccessToken,
  generateSellerRefreshToken,
  normalizeEmail,
  verifySellerRefreshToken,
} from "./sellerAuth.helper.js";

function buildSellerSessionPayload(seller: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}) {
  return {
    id: seller.id,
    email: seller.email,
    firstName: seller.firstName,
    lastName: seller.lastName,
  };
}

export async function loginSeller(
  env: Env,
  input: { email: string; password: string }
) {
  const seller = await Seller.findOne({
    email: normalizeEmail(input.email),
  });

  if (!seller) {
    throw new AppError(401, "Invalid credentials");
  }

  const validPassword = await comparePassword(input.password, seller.password);
  if (!validPassword) {
    throw new AppError(401, "Invalid credentials");
  }

  if (!seller.isActive) {
    throw new AppError(
      403,
      "Please verify your email before signing in",
      "EMAIL_NOT_VERIFIED"
    );
  }

  const accessToken = generateSellerAccessToken(env, {
    sub: seller.id,
    email: seller.email,
    role: "SELLER",
  });

  const { token: refreshToken } = generateSellerRefreshToken(env, {
    sub: seller.id,
  });

  return {
    accessToken,
    refreshToken,
    seller: buildSellerSessionPayload(seller),
  };
}

export async function refreshSellerSession(
  env: Env,
  refreshTokenRaw: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  seller: ReturnType<typeof buildSellerSessionPayload>;
}> {
  const invalid = new AppError(
    401,
    "Invalid or expired refresh token",
    "REFRESH_INVALID"
  );

  let payload;
  try {
    payload = verifySellerRefreshToken(env, refreshTokenRaw);
  } catch {
    throw invalid;
  }

  const seller = await Seller.findById(payload.sub);

  if (!seller) {
    throw invalid;
  }

  const accessToken = generateSellerAccessToken(env, {
    sub: seller.id,
    email: seller.email,
    role: "SELLER",
  });

  const { token: refreshToken } = generateSellerRefreshToken(env, {
    sub: seller.id,
  });

  return {
    accessToken,
    refreshToken,
    seller: buildSellerSessionPayload(seller),
  };
}

export async function getSellerMe(sellerId: string) {
  const seller = await Seller.findById(sellerId).select("firstName lastName email");

  if (!seller) {
    throw new AppError(404, "Seller not found");
  }

  return {
    id: seller.id,
    firstName: seller.firstName,
    lastName: seller.lastName,
    email: seller.email,
  };
}
