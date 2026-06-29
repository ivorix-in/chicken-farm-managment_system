import { rateLimit } from "express-rate-limit";
import type { Env } from "../../../core/env.js";

export function createAdminForgotPasswordRateLimit(env: Env) {
  return rateLimit({
    windowMs: env.ADMIN_AUTH_FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MS,
    limit: env.ADMIN_AUTH_FORGOT_PASSWORD_RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: {
        message: "Too many password reset requests. Try again later.",
        code: "RATE_LIMIT_FORGOT_PASSWORD",
      },
    },
  });
}

export function createAdminResetPasswordRateLimit(env: Env) {
  return rateLimit({
    windowMs: env.ADMIN_AUTH_RESET_PASSWORD_RATE_LIMIT_WINDOW_MS,
    limit: env.ADMIN_AUTH_RESET_PASSWORD_RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: {
        message: "Too many reset attempts. Try again later.",
        code: "RATE_LIMIT_RESET_PASSWORD",
      },
    },
  });
}

export function createAdminRefreshRateLimit(env: Env) {
  return rateLimit({
    windowMs: env.ADMIN_AUTH_REFRESH_RATE_LIMIT_WINDOW_MS,
    limit: env.ADMIN_AUTH_REFRESH_RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: {
        message: "Too many token refresh requests. Try again later.",
        code: "RATE_LIMIT_REFRESH",
      },
    },
  });
}
