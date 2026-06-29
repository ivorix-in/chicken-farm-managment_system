import type { Express } from "express";
import { Router } from "express";
import type { Env } from "../../../core/env.js";
import { PERMISSIONS } from "../../../Constants/permissions.js";
import { createAdminAuthMiddleware } from "../Auth/adminAuth.middleware.js";
import { createAdminUsersController } from "./adminUsers.controller.js";

/** Admin user routes (listing roles moved to Roles module `/roles`). */
export function registerAdminUsersRoutes(
  app: Express,
  env: Env,
  adminBase: string
): void {
  const router = Router();
  const { requireAuth, requirePermission } = createAdminAuthMiddleware(env);
  const ctrl = createAdminUsersController(env);

  router.post(
    "/users",
    requireAuth,
    requirePermission(PERMISSIONS.ADMIN.USER.CREATE),
    ctrl.create
  );

  app.use(adminBase, router);
}
