import type { Express } from "express";
import { Router } from "express";
import type { Env } from "../../core/env.js";
import { createAdminAuthMiddleware } from "../admin/Auth/adminAuth.middleware.js";
import { createCollectionReportsController } from "./collectionReports.controller.js";

export function registerCollectionReportsRoutes(app: Express, env: Env, base: string): void {
  const router = Router();
  const { requireAuth, requirePermission } = createAdminAuthMiddleware(env);
  const ctrl = createCollectionReportsController();

  router.get("/", requireAuth, requirePermission("collection-reports:read"), ctrl.list);
  router.post("/", requireAuth, requirePermission("collection-reports:write"), ctrl.create);
  router.get("/:id", requireAuth, requirePermission("collection-reports:read"), ctrl.getOne);
  router.put("/:id", requireAuth, requirePermission("collection-reports:write"), ctrl.update);
  router.post("/:id/submit", requireAuth, requirePermission("collection-reports:write"), ctrl.submit);
  router.delete("/:id", requireAuth, requirePermission("collection-reports:write"), ctrl.remove);

  app.use(`${base}/collection-reports`, router);
}
