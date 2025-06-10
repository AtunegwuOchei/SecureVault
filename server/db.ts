import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Prevent multiple pool/db instances during development (hot reloads)
const globalForDrizzle = globalThis as unknown as {
  pool?: Pool;
  db?: ReturnType<typeof drizzle>;
};

export const pool =
  globalForDrizzle.pool ??
  new Pool({ connectionString: process.env.DATABASE_URL });
export const db = globalForDrizzle.db ?? drizzle({ client: pool, schema });

if (process.env.NODE_ENV !== "production") {
  globalForDrizzle.pool = pool;
  globalForDrizzle.db = db;
}
