import type { Express } from "express";
import { Router } from "express";
import type { Env } from "../../core/env.js";
import { createAdminAuthMiddleware } from "../admin/Auth/adminAuth.middleware.js";
import { createFarmersController } from "./farmers.controller.js";

export function registerFarmersRoutes(app: Express, env: Env, base: string): void {
  const router = Router();
  const { requireAuth, requirePermission } = createAdminAuthMiddleware(env);
  const ctrl = createFarmersController();

  router.get("/", requireAuth, requirePermission("farmers:read"), ctrl.list);
  router.post("/", requireAuth, requirePermission("farmers:write"), ctrl.create);
  router.get("/:id", requireAuth, requirePermission("farmers:read"), ctrl.getOne);
  router.put("/:id", requireAuth, requirePermission("farmers:write"), ctrl.update);
  router.delete("/:id", requireAuth, requirePermission("farmers:write"), ctrl.remove);

  app.use(`${base}/farmers`, router);
}
