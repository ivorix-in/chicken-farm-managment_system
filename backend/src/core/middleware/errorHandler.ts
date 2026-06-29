import type { ErrorRequestHandler } from "express";
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
} from "@prisma/client/runtime/library";
import { isAppError } from "../errors/AppError.js";
import { ZodError } from "zod";

function isPrismaUnreachable(err: unknown): boolean {
  if (err instanceof PrismaClientInitializationError) return true;
  if (err instanceof PrismaClientKnownRequestError) {
    /** @see https://www.prisma.io/docs/reference/api-reference/error-reference */
    const connectivity = ["P1001", "P1002", "P1017"];
    return connectivity.includes(err.code);
  }
  // `instanceof` can fail across bundles; fall back to Prisma’s error shape / message.
  if (err != null && typeof err === "object") {
    const e = err as { name?: string; message?: string };
    if (e.name === "PrismaClientInitializationError") return true;
    if (
      typeof e.message === "string" &&
      (/Can't reach database server|P1001|P1002|P1017/u.test(e.message) ||
        e.message.includes("PrismaClientInitializationError"))
    ) {
      return true;
    }
  }
  return false;
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (isAppError(err)) {
    res.status(err.statusCode).json({
      error: { message: err.message, code: err.code },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: { message: "Validation failed", details: err.flatten() },
    });
    return;
  }

  if (isPrismaUnreachable(err)) {
    console.error(err);
    res.status(503).json({
      error: {
        message:
          "Database is unavailable. If you use Neon: open the dashboard to resume the project, use the pooled URL with ?sslmode=require&pgbouncer=true (remove channel_binding), verify credentials, then retry.",
        code: "DB_UNAVAILABLE",
      },
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: { message: "Internal server error" },
  });
};
