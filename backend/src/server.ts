import "dotenv/config";
import { createServer } from "http";
import { loadEnv } from "./core/env.js";
import { createApp } from "./app.js";
import { prisma } from "./core/prisma.js";

const env = loadEnv();
const app = createApp(env);
const server = createServer(app);

server.listen(env.PORT, () => {
  console.log(`Server listening on http://localhost:${env.PORT}`);
});

async function shutdown(signal: string) {
  console.log(`${signal} received, shutting down`);
  server.close(() => console.log("HTTP server closed"));
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
