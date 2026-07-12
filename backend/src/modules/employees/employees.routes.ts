import type { Express } from "express";
import { Router } from "express";
import type { Env } from "../../core/env.js";
import { createAdminAuthMiddleware } from "../admin/Auth/adminAuth.middleware.js";
import { createEmployeesController } from "./employees.controller.js";

export function registerEmployeesRoutes(app: Express, env: Env, base: string): void {
  const router = Router();
  const { requireAuth, requirePermission } = createAdminAuthMiddleware(env);
  const ctrl = createEmployeesController();

  router.get("/", requireAuth, requirePermission("employees:read"), ctrl.list);
  router.post("/", requireAuth, requirePermission("employees:write"), ctrl.create);
  router.get("/:id", requireAuth, requirePermission("employees:read"), ctrl.getOne);
  router.put("/:id", requireAuth, requirePermission("employees:write"), ctrl.update);
  router.delete("/:id", requireAuth, requirePermission("employees:write"), ctrl.remove);

  app.use(`${base}/employees`, router);
}
