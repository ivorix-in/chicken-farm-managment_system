import type { Express } from "express";
import { Router } from "express";
import type { Env } from "../../../core/env.js";
import { PERMISSIONS } from "../../../Constants/permissions.js";
import { createAdminAuthMiddleware } from "../Auth/adminAuth.middleware.js";
import { createAdminSellersController } from "./adminSellers.controller.js";

export function registerAdminSellersRoutes(
  app: Express,
  env: Env,
  adminBase: string
): void {
  const router = Router();
  const { requireAuth, requirePermission } = createAdminAuthMiddleware(env);
  const ctrl = createAdminSellersController(env);

  router.get(
    "/sellers",
    requireAuth,
    requirePermission(PERMISSIONS.ADMIN.SELLER.READ),
    ctrl.list
  );
  router.get(
    "/sellers/:sellerId",
    requireAuth,
    requirePermission(PERMISSIONS.ADMIN.SELLER.READ),
    ctrl.getById
  );
  router.post(
    "/sellers",
    requireAuth,
    requirePermission(PERMISSIONS.ADMIN.SELLER.CREATE),
    ctrl.create
  );
  router.patch(
    "/sellers/:sellerId",
    requireAuth,
    requirePermission(PERMISSIONS.ADMIN.SELLER.UPDATE),
    ctrl.update
  );
  router.delete(
    "/sellers/:sellerId",
    requireAuth,
    requirePermission(PERMISSIONS.ADMIN.SELLER.DELETE),
    ctrl.remove
  );

  app.use(adminBase, router);
}
