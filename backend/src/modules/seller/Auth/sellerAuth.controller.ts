import type { RequestHandler } from "express";
import { asyncHandler } from "../../../core/http/asyncHandler.js";
import { AppError } from "../../../core/errors/AppError.js";
import type { Env } from "../../../core/env.js";
import {
  getSellerMe,
  loginSeller,
  refreshSellerSession,
} from "./sellerAuth.service.js";
import {
  requestSellerPasswordReset,
  resetSellerPasswordWithOtp,
  verifySellerPasswordResetOtp,
} from "./sellerPasswordReset.service.js";
import {
  registerSeller,
  verifyRegistrationOtp,
  resendRegistrationOtp,
} from "./sellerRegistration.service.js";
import {
  forgotPasswordBody,
  loginBody,
  refreshBody,
  registerBody,
  resendRegistrationOtpBody,
  resetPasswordBody,
  verifyOtpBody,
  verifyRegistrationOtpBody,
} from "./sellerAuth.validator.js";

export function createSellerAuthController(env: Env) {
  const register: RequestHandler = asyncHandler(async (req, res) => {
    const body = registerBody.parse(req.body);
    const result = await registerSeller(env, body);
    res.status(201).json(result);
  });

  const verifyEmail: RequestHandler = asyncHandler(async (req, res) => {
    const body = verifyRegistrationOtpBody.parse(req.body);
    const result = await verifyRegistrationOtp(env, body);
    res.json(result);
  });

  const resendEmailOtp: RequestHandler = asyncHandler(async (req, res) => {
    const body = resendRegistrationOtpBody.parse(req.body);
    const result = await resendRegistrationOtp(env, body);
    res.json(result);
  });

  const login: RequestHandler = asyncHandler(async (req, res) => {
    const body = loginBody.parse(req.body);
    const result = await loginSeller(env, body);
    res.json(result);
  });

  const refresh: RequestHandler = asyncHandler(async (req, res) => {
    const body = refreshBody.parse(req.body);
    const result = await refreshSellerSession(env, body.refreshToken);
    res.json(result);
  });

  const me: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) {
      throw new AppError(401, "Unauthorized");
    }
    const seller = await getSellerMe(req.auth.userId);
    res.json({ seller });
  });

  const forgotPassword: RequestHandler = asyncHandler(async (req, res) => {
    const body = forgotPasswordBody.parse(req.body);
    const result = await requestSellerPasswordReset(env, body);
    res.json(result);
  });

  const verifyOtp: RequestHandler = asyncHandler(async (req, res) => {
    const body = verifyOtpBody.parse(req.body);
    const result = await verifySellerPasswordResetOtp(env, body);
    res.json(result);
  });

  const resetPassword: RequestHandler = asyncHandler(async (req, res) => {
    const body = resetPasswordBody.parse(req.body);
    const result = await resetSellerPasswordWithOtp(env, body);
    res.json(result);
  });

  return { register, verifyEmail, resendEmailOtp, login, refresh, me, forgotPassword, verifyOtp, resetPassword };
}
