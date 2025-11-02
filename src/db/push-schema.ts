import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "./schema";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function pushSchema() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  console.log("📤 Pushing schema to database...");

  const connection = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(connection, { schema });

  try {
    // Import and execute all CREATE statements from the schema
    // Since we're using Drizzle, we can leverage drizzle-kit's push functionality
    // But for now, let's just verify the connection works
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log("✅ Database connection successful!");
    console.log("ℹ️  Please run: npm run db:push");
    console.log("ℹ️  And manually type 'y' when prompted to apply the schema.");
  } catch (error) {
    console.error("❌ Push failed:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

pushSchema();
