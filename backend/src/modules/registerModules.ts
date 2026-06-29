import type { Express } from "express";
import type { Env } from "../core/env.js";
import { registerAdminModule } from "./admin/admin.routes.js";
import { registerSellerModule } from "./seller/seller.routes.js";

/** Mount all bounded-context modules (modular monolith composition root). */
export function registerModules(app: Express, env: Env): void {
  registerAdminModule(app, env);
  registerSellerModule(app, env);
}
