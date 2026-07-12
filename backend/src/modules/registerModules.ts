import type { Express } from "express";
import type { Env } from "../core/env.js";
import { registerAdminModule } from "./admin/admin.routes.js";
import { registerSellerModule } from "./seller/seller.routes.js";
import { registerFarmersRoutes } from "./farmers/farmers.routes.js";
import { registerAreasRoutes } from "./areas/areas.routes.js";
import { registerFarmsRoutes } from "./farms/farms.routes.js";
import { registerEmployeesRoutes } from "./employees/employees.routes.js";
import { registerBatchesRoutes } from "./batches/batches.routes.js";
import { registerDailyVisitsRoutes } from "./dailyVisits/dailyVisits.routes.js";
import { registerFeedRoutes } from "./feed/feed.routes.js";
import { registerMedicinesRoutes } from "./medicines/medicines.routes.js";
import { registerDashboardRoutes } from "./dashboard/dashboard.routes.js";
import { registerAccountingRoutes } from "./accounting/accounting.routes.js";

const ERP_BASE = "/api/v1/admin";

/** Mount all bounded-context modules (modular monolith composition root). */
export function registerModules(app: Express, env: Env): void {
  // Existing modules
  registerAdminModule(app, env);
  registerSellerModule(app, env);

  // ERP Phase 0 modules
  registerFarmersRoutes(app, env, ERP_BASE);
  registerAreasRoutes(app, env, ERP_BASE);
  registerFarmsRoutes(app, env, ERP_BASE);
  registerEmployeesRoutes(app, env, ERP_BASE);
  registerBatchesRoutes(app, env, ERP_BASE);
  registerDailyVisitsRoutes(app, env, ERP_BASE);
  registerFeedRoutes(app, env, ERP_BASE);
  registerMedicinesRoutes(app, env, ERP_BASE);
  registerDashboardRoutes(app, env, ERP_BASE);
  registerAccountingRoutes(app, env, ERP_BASE);
}
