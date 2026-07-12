import type { Express } from "express";
import { Router } from "express";
import type { Env } from "../../core/env.js";
import { createAdminAuthMiddleware } from "../admin/Auth/adminAuth.middleware.js";
import { createFarmsController } from "./farms.controller.js";

export function registerFarmsRoutes(app: Express, env: Env, base: string): void {
  const router = Router();
  const { requireAuth, requirePermission } = createAdminAuthMiddleware(env);
  const ctrl = createFarmsController();

  router.get("/", requireAuth, requirePermission("farms:read"), ctrl.list);
  router.post("/", requireAuth, requirePermission("farms:write"), ctrl.create);
  router.get("/:id", requireAuth, requirePermission("farms:read"), ctrl.getOne);
  router.get("/:id/batches", requireAuth, requirePermission("farms:read"), ctrl.getBatches);
  router.put("/:id", requireAuth, requirePermission("farms:write"), ctrl.update);
  router.delete("/:id", requireAuth, requirePermission("farms:write"), ctrl.remove);

  app.use(`${base}/farms`, router);
}
