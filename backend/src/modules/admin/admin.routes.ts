import type { Express } from "express";
import type { Env } from "../../core/env.js";
import { registerAdminAuthRoutes } from "./Auth/adminAuth.routes.js";
import { registerAdminRolesRoutes } from "./Roles/adminRoles.routes.js";
import { registerAdminUsersRoutes } from "./Users/adminUsers.routes.js";
import { registerAdminSellersRoutes } from "./Sellers/adminSellers.routes.js";

const BASE = "/api/v1/admin";

export function registerAdminModule(app: Express, env: Env): void {
  registerAdminAuthRoutes(app, env, BASE);
  registerAdminRolesRoutes(app, env, BASE);
  registerAdminUsersRoutes(app, env, BASE);
  registerAdminSellersRoutes(app, env, BASE);
}
