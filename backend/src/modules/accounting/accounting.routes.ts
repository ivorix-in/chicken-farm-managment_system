import type { Express } from "express";
import { Router } from "express";
import type { Env } from "../../../core/env.js";
import { PERMISSIONS } from "../../../Constants/permissions.js";
import { createAdminAuthMiddleware } from "../admin/Auth/adminAuth.middleware.js";
import { createAccountingController } from "./accounting.controller.js";

export function registerAccountingRoutes(app: Express, env: Env, adminBase: string) {
  const router = Router();
  const { requireAuth, requirePermission } = createAdminAuthMiddleware(env);
  const ctrl = createAccountingController(env);

  // For now, only require SUPER_ADMIN or standard admin access. 
  // We can fine-tune permissions later.
  router.use(requireAuth);

  router.post("/transactions", ctrl.create);
  router.get("/transactions", ctrl.list);
  router.get("/pnl/summary", ctrl.getSummary);

  app.use(`${adminBase}/accounting`, router);
}
