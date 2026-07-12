import type { Express } from "express";
import { Router } from "express";
import type { Env } from "../../core/env.js";
import { createAdminAuthMiddleware } from "../admin/Auth/adminAuth.middleware.js";
import { createVehiclesController } from "./vehicles.controller.js";

export function registerVehiclesRoutes(app: Express, env: Env, base: string): void {
  const router = Router();
  const { requireAuth, requirePermission } = createAdminAuthMiddleware(env);
  const ctrl = createVehiclesController();

  router.get("/", requireAuth, requirePermission("vehicles:read"), ctrl.list);
  router.post("/", requireAuth, requirePermission("vehicles:write"), ctrl.create);
  router.get("/:id", requireAuth, requirePermission("vehicles:read"), ctrl.getOne);
  router.put("/:id", requireAuth, requirePermission("vehicles:write"), ctrl.update);
  router.delete("/:id", requireAuth, requirePermission("vehicles:write"), ctrl.remove);

  app.use(`${base}/vehicles`, router);
}
