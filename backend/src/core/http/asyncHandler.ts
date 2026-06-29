import type { RequestHandler } from "express";

/** Wraps async route handlers so errors reach Express error middleware. */
export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req, res, next) => {
    void Promise.resolve(fn(req, res, next)).catch(next);
  };
}
