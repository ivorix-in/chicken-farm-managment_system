import type { Express } from "express";
import { Router } from "express";
import type { Env } from "../../core/env.js";
import { createAdminAuthMiddleware } from "../admin/Auth/adminAuth.middleware.js";
import { createFeedController } from "./feed.controller.js";

export function registerFeedRoutes(app: Express, env: Env, base: string): void {
  const router = Router();
  const { requireAuth, requirePermission } = createAdminAuthMiddleware(env);
  const ctrl = createFeedController();

  router.get("/stock", requireAuth, requirePermission("feed:read"), ctrl.getStock);
  router.put("/stock", requireAuth, requirePermission("feed:write"), ctrl.updateStock);
  router.get("/transactions", requireAuth, requirePermission("feed:read"), ctrl.listTransactions);
  router.get("/transactions/batch/:batchId", requireAuth, requirePermission("feed:read"), ctrl.getBatchTotal);
  router.post("/transactions", requireAuth, requirePermission("feed:write"), ctrl.createTransaction);

  app.use(`${base}/feed`, router);
}
