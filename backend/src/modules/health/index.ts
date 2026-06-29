import type { Express } from "express";
import { createHealthRouter } from "./health.routes.js";

export function registerHealthModule(app: Express): void {
  app.use("/health", createHealthRouter());
}
