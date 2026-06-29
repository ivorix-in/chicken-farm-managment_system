import type { Express } from "express";
import { Router } from "express";
import type { Env } from "../../../core/env.js";
import { createAdminAuthMiddleware } from "./adminAuth.middleware.js";
import { createAdminAuthController } from "./adminAuth.controller.js";
import {
  createAdminForgotPasswordRateLimit,
  createAdminRefreshRateLimit,
  createAdminResetPasswordRateLimit,
} from "./adminAuth.rateLimit.js";

export function registerAdminAuthRoutes(
  app: Express,
  env: Env,
  adminBase: string
): void {
  const router = Router();
  const { requireAuth } = createAdminAuthMiddleware(env);
  const ctrl = createAdminAuthController(env);
  const forgotPasswordLimit = createAdminForgotPasswordRateLimit(env);
  const resetPasswordLimit = createAdminResetPasswordRateLimit(env);
  const refreshLimit = createAdminRefreshRateLimit(env);

  router.post("/login", ctrl.login);
  router.post("/refresh", refreshLimit, ctrl.refresh);
  router.post(
    "/forgot-password",
    forgotPasswordLimit,
    ctrl.forgotPassword
  );
  router.post("/reset-password", resetPasswordLimit, ctrl.resetPassword);
  router.get("/me", requireAuth, ctrl.me);

  app.use(`${adminBase}/auth`, router);
}
