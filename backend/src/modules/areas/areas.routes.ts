import type { Express } from "express";
import { Router } from "express";
import type { Env } from "../../core/env.js";
import { createAdminAuthMiddleware } from "../admin/Auth/adminAuth.middleware.js";
import { createAreasController } from "./areas.controller.js";

export function registerAreasRoutes(app: Express, env: Env, base: string): void {
  const router = Router();
  const { requireAuth, requirePermission } = createAdminAuthMiddleware(env);
  const ctrl = createAreasController();

  router.get("/", requireAuth, requirePermission("areas:read"), ctrl.list);
  router.post("/", requireAuth, requirePermission("areas:write"), ctrl.create);
  router.get("/:id", requireAuth, requirePermission("areas:read"), ctrl.getOne);
  router.put("/:id", requireAuth, requirePermission("areas:write"), ctrl.update);
  router.delete("/:id", requireAuth, requirePermission("areas:write"), ctrl.remove);

  app.use(`${base}/areas`, router);
}
