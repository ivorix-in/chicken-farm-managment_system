import type { RequestHandler } from "express";
import type { Env } from "../../../core/env.js";
import { AppError } from "../../../core/errors/AppError.js";
import { AdminUser } from "../models/index.js";
import { asyncHandler } from "../../../core/http/asyncHandler.js";
import {
  AdminAuthTokenError,
  hasPermission,
  verifyAdminAccessToken,
} from "./adminAuth.helper.js";

export function createAdminAuthMiddleware(env: Env) {
  const requireAuth: RequestHandler = (req, _res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      next(new AppError(401, "Missing or invalid authorization header"));
      return;
    }
    const token = header.slice("Bearer ".length).trim();
    try {
      const payload = verifyAdminAccessToken(env, token);
      req.auth = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
      };
      next();
    } catch (e) {
      if (e instanceof AdminAuthTokenError) {
        next(new AppError(401, e.message));
        return;
      }
      next(e);
    }
  };

  /** Requires valid Bearer JWT and admin.active + RBAC permission on AdminRole.permissions. */
  const requirePermission = (permission: string): RequestHandler =>
    asyncHandler(async (req, _res, next) => {
      if (!req.auth) {
        throw new AppError(401, "Unauthorized");
      }
      const adminUser = await AdminUser.findById(req.auth.userId).populate("role");

      if (!adminUser || !adminUser.isActive || adminUser.deletedAt) {
        throw new AppError(403, "Forbidden");
      }

      const roleObj = adminUser.role as any;
      if (!roleObj) {
        throw new AppError(403, "Forbidden");
      }

      const allowed = hasPermission(
        {
          role: { permissions: roleObj.permissions },
        },
        permission
      );

      if (!allowed) {
        throw new AppError(403, "Forbidden");
      }

      req.admin = {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        mobileNumber: adminUser.mobileNumber ?? null,
        isActive: adminUser.isActive,
        role: roleObj,
      };
      next();
    });

  const requireRoles =
    (...roles: string[]): RequestHandler =>
    (req, _res, next) => {
      if (!req.auth) {
        next(new AppError(401, "Unauthorized"));
        return;
      }
      if (!roles.includes(req.auth.role)) {
        next(new AppError(403, "Forbidden"));
        return;
      }
      next();
    };

  return { requireAuth, requirePermission, requireRoles };
}
