import type { Express } from "express";
import { Router } from "express";
import type { Env } from "../../core/env.js";
import { createAdminAuthMiddleware } from "../admin/Auth/adminAuth.middleware.js";
import { asyncHandler } from "../../core/http/asyncHandler.js";
import { getDashboardKpis } from "./dashboard.service.js";

export function registerDashboardRoutes(app: Express, env: Env, base: string): void {
  const router = Router();
  const { requireAuth, requirePermission } = createAdminAuthMiddleware(env);

  router.get(
    "/kpis",
    requireAuth,
    requirePermission("dashboard:read"),
    asyncHandler(async (_req, res) => {
      const kpis = await getDashboardKpis();
      res.json({ kpis });
    })
  );

  app.use(`${base}/dashboard`, router);
}
