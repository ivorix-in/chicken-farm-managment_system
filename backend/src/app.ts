import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import type { Env } from "./core/env.js";
import { errorHandler } from "./core/middleware/errorHandler.js";
import { notFoundHandler } from "./core/middleware/notFound.js";
import { registerModules } from "./modules/registerModules.js";
import { registerSwaggerDocs } from "./core/docs/swagger.js";

export function createApp(env: Env): express.Express {
  const app = express();

  if (env.TRUST_PROXY) {
    app.set("trust proxy", 1);
  }

  app.use(helmet());
  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://localhost:5174",
      ],
      credentials: true,
    })
  );
  app.use(express.json());
  if (env.NODE_ENV !== "test") {
    app.use(morgan("dev"));
  }

  app.get("/", (_req, res) => {
    res.json({ message: "Chicken Farm Management API", docs: "/api-docs" });
  });

  registerSwaggerDocs(app);
  registerModules(app, env);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
