import type { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { isAppError } from "../errors/AppError.js";
import { ZodError } from "zod";

function isMongoUnreachable(err: unknown): boolean {
  if (err instanceof mongoose.Error) {
    if (err.name === "MongooseServerSelectionError") return true;
  }
  if (err != null && typeof err === "object") {
    const e = err as { name?: string; message?: string };
    if (e.name === "MongooseServerSelectionError" || e.name === "MongoNetworkError") return true;
    if (
      typeof e.message === "string" &&
      (e.message.includes("MongooseServerSelectionError") || e.message.includes("MongoNetworkError"))
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

  if (isMongoUnreachable(err)) {
    console.error(err);
    res.status(503).json({
      error: {
        message:
          "Database is unavailable. Please verify your MongoDB connection string and ensure MongoDB service is running.",
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
