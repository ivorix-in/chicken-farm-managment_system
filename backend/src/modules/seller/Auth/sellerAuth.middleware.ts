import type { RequestHandler } from "express";
import type { Env } from "../../../core/env.js";
import { AppError } from "../../../core/errors/AppError.js";
import { verifySellerAccessToken } from "./sellerAuth.helper.js";

export function createSellerAuthMiddleware(env: Env) {
  const requireAuth: RequestHandler = (req, _res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      next(new AppError(401, "Missing or invalid authorization header"));
      return;
    }

    const token = header.slice("Bearer ".length).trim();
    try {
      const payload = verifySellerAccessToken(env, token);
      req.auth = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
      };
      next();
    } catch (error) {
      next(new AppError(401, error instanceof Error ? error.message : "Unauthorized"));
    }
  };

  const requireSellerRole: RequestHandler = (req, _res, next) => {
    if (!req.auth) {
      next(new AppError(401, "Unauthorized"));
      return;
    }
    if (req.auth.role !== "SELLER") {
      next(new AppError(403, "Forbidden"));
      return;
    }
    next();
  };

  return { requireAuth, requireSellerRole };
}
