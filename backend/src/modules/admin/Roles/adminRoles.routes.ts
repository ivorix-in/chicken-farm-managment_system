import type { Express } from "express";
import { Router } from "express";
import type { Env } from "../../../core/env.js";
import { PERMISSIONS } from "../../../Constants/permissions.js";
import { createAdminAuthMiddleware } from "../Auth/adminAuth.middleware.js";
import { createAdminRolesController } from "./adminRoles.controller.js";

export function registerAdminRolesRoutes(app: Express, env: Env, adminBase: string): void {
  const router = Router();
  const { requireAuth, requirePermission } = createAdminAuthMiddleware(env);
  const ctrl = createAdminRolesController(env);

  router.get(
    "/permissions-catalog",
    requireAuth,
    requirePermission(PERMISSIONS.ADMIN.ROLE.READ),
    ctrl.permissionsCatalog
  );
  router.get(
    "/roles",
    requireAuth,
    requirePermission(PERMISSIONS.ADMIN.ROLE.READ),
    ctrl.list
  );
  router.post(
    "/roles",
    requireAuth,
    requirePermission(PERMISSIONS.ADMIN.ROLE.CREATE),
    ctrl.create
  );
  router.patch(
    "/roles/:roleId",
    requireAuth,
    requirePermission(PERMISSIONS.ADMIN.ROLE.UPDATE),
    ctrl.update
  );
  router.delete(
    "/roles/:roleId",
    requireAuth,
    requirePermission(PERMISSIONS.ADMIN.ROLE.DELETE),
    ctrl.remove
  );

  app.use(adminBase, router);
}
