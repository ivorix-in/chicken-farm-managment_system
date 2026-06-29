import type { RequestHandler } from "express";
import { asyncHandler } from "../../../core/http/asyncHandler.js";
import { AppError } from "../../../core/errors/AppError.js";
import type { Env } from "../../../core/env.js";
import {
  getAdminMe,
  loginAdmin,
  refreshAdminSession,
  requestAdminPasswordReset,
  resetAdminPasswordWithOtp,
} from "./adminAuth.service.js";
import {
  forgotPasswordBody,
  loginBody,
  refreshBody,
  resetPasswordBody,
} from "./adminAuth.validator.js";

export function createAdminAuthController(env: Env) {
  const login: RequestHandler = asyncHandler(async (req, res) => {
    const body = loginBody.parse(req.body);
    const result = await loginAdmin(env, body);
    res.json(result);
  });

  const me: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) {
      throw new AppError(401, "Unauthorized");
    }
    const admin = await getAdminMe(req.auth.userId);
    res.json({ admin });
  });

  const forgotPassword: RequestHandler = asyncHandler(async (req, res) => {
    const body = forgotPasswordBody.parse(req.body);
    const result = await requestAdminPasswordReset(env, body);
    res.json(result);
  });

  const resetPassword: RequestHandler = asyncHandler(async (req, res) => {
    const body = resetPasswordBody.parse(req.body);
    const result = await resetAdminPasswordWithOtp(env, body);
    res.json(result);
  });

  const refresh: RequestHandler = asyncHandler(async (req, res) => {
    const body = refreshBody.parse(req.body);
    const result = await refreshAdminSession(env, body.refreshToken);
    res.json(result);
  });

  return { login, me, forgotPassword, resetPassword, refresh };
}
