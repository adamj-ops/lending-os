import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
import { env } from "@/lib/env";

// Create Neon HTTP connection (optimized for serverless)
const sql = neon(env.DATABASE_URL);

// Create drizzle instance
export const db = drizzle(sql, { schema });

// Export types
export type Database = typeof db;
