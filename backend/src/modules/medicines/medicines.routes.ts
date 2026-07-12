import type { Express } from "express";
import { Router } from "express";
import type { Env } from "../../core/env.js";
import { createAdminAuthMiddleware } from "../admin/Auth/adminAuth.middleware.js";
import { createMedicinesController } from "./medicines.controller.js";

export function registerMedicinesRoutes(app: Express, env: Env, base: string): void {
  const router = Router();
  const { requireAuth, requirePermission } = createAdminAuthMiddleware(env);
  const ctrl = createMedicinesController();

  // Medicines
  router.get("/", requireAuth, requirePermission("medicines:read"), ctrl.list);
  router.post("/", requireAuth, requirePermission("medicines:write"), ctrl.create);
  router.get("/:id", requireAuth, requirePermission("medicines:read"), ctrl.getOne);
  router.put("/:id", requireAuth, requirePermission("medicines:write"), ctrl.update);
  router.delete("/:id", requireAuth, requirePermission("medicines:write"), ctrl.remove);

  // Prescriptions
  router.get("/prescriptions/list", requireAuth, requirePermission("prescriptions:read"), ctrl.listRx);
  router.post("/prescriptions", requireAuth, requirePermission("prescriptions:write"), ctrl.createRx);
  router.get("/prescriptions/:id", requireAuth, requirePermission("prescriptions:read"), ctrl.getOneRx);
  router.put("/prescriptions/:id/dispense", requireAuth, requirePermission("prescriptions:write"), ctrl.dispense);

  app.use(`${base}/medicines`, router);
}
