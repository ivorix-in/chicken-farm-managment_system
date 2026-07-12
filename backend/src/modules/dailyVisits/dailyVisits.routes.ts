import type { Express } from "express";
import { Router } from "express";
import type { Env } from "../../core/env.js";
import { createAdminAuthMiddleware } from "../admin/Auth/adminAuth.middleware.js";
import { createDailyVisitsController } from "./dailyVisits.controller.js";

export function registerDailyVisitsRoutes(app: Express, env: Env, base: string): void {
  const router = Router();
  const { requireAuth, requirePermission } = createAdminAuthMiddleware(env);
  const ctrl = createDailyVisitsController();

  router.get("/", requireAuth, requirePermission("visits:read"), ctrl.list);
  router.post("/", requireAuth, requirePermission("visits:write"), ctrl.create);
  router.get("/batch/:batchId", requireAuth, requirePermission("visits:read"), ctrl.getByBatch);
  router.get("/:id", requireAuth, requirePermission("visits:read"), ctrl.getOne);

  app.use(`${base}/daily-visits`, router);
}
