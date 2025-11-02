import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create Neon HTTP connection (optimized for serverless)
const sql = neon(process.env.DATABASE_URL);

// Create drizzle instance
export const db = drizzle(sql, { schema });

// Export types
export type Database = typeof db;

