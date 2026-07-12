import type { Express } from "express";
import { Router } from "express";
import type { Env } from "../../core/env.js";
import { createAdminAuthMiddleware } from "../admin/Auth/adminAuth.middleware.js";
import { createBatchesController } from "./batches.controller.js";

export function registerBatchesRoutes(app: Express, env: Env, base: string): void {
  const router = Router();
  const { requireAuth, requirePermission } = createAdminAuthMiddleware(env);
  const ctrl = createBatchesController();

  router.get("/", requireAuth, requirePermission("batches:read"), ctrl.list);
  router.post("/", requireAuth, requirePermission("batches:write"), ctrl.create);
  router.get("/:id", requireAuth, requirePermission("batches:read"), ctrl.getOne);
  router.get("/:id/summary", requireAuth, requirePermission("batches:read"), ctrl.summary);
  router.put("/:id", requireAuth, requirePermission("batches:write"), ctrl.update);
  router.post("/:id/close", requireAuth, requirePermission("batches:write"), ctrl.close);

  app.use(`${base}/batches`, router);
}
