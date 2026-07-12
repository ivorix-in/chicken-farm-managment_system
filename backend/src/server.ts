import "dotenv/config";
import { createServer } from "http";
import { loadEnv } from "./core/env.js";
import { createApp } from "./app.js";
import { connectDb, disconnectDb } from "./core/db.js";

const env = loadEnv();

// Connect to MongoDB
await connectDb(env.DATABASE_URL);

const app = createApp(env);
const server = createServer(app);

server.listen(env.PORT, () => {
  console.log(`Server listening on http://localhost:${env.PORT}`);
});

async function shutdown(signal: string) {
  console.log(`${signal} received, shutting down`);
  server.close(() => console.log("HTTP server closed"));
  await disconnectDb();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
