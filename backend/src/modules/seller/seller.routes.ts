import type { Express } from "express";
import { Router } from "express";
import type { Env } from "../../core/env.js";
import { createSellerAuthController } from "./Auth/sellerAuth.controller.js";
import { createSellerAuthMiddleware } from "./Auth/sellerAuth.middleware.js";

const BASE = "/api/v1/seller";

export function registerSellerModule(app: Express, env: Env): void {
  const router = Router();
  const ctrl = createSellerAuthController(env);
  const { requireAuth, requireSellerRole } = createSellerAuthMiddleware(env);

  router.post("/auth/register", ctrl.register);
  router.post("/auth/verify-email", ctrl.verifyEmail);
  router.post("/auth/resend-email-otp", ctrl.resendEmailOtp);
  router.post("/auth/login", ctrl.login);
  router.post("/auth/refresh", ctrl.refresh);
  router.post("/auth/forgot-password", ctrl.forgotPassword);
  router.post("/auth/verify-otp", ctrl.verifyOtp);
  router.post("/auth/reset-password", ctrl.resetPassword);
  router.get("/auth/me", requireAuth, requireSellerRole, ctrl.me);

  app.use(BASE, router);
}
