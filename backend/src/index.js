import http from "http";
import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

async function start() {
  await connectDatabase();

  const server = http.createServer(app);
  server.listen(env.port, () => {
    console.log(`LOWKEY API running on port ${env.port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
