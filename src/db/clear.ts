import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function clearDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  console.log("🗑️  Clearing database...");

  const connection = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(connection);

  try {
    // Drop all tables by dropping and recreating the public schema
    console.log("Dropping public schema...");
    await db.execute(sql`DROP SCHEMA IF EXISTS public CASCADE`);
    await db.execute(sql`CREATE SCHEMA public`);
    await db.execute(sql`GRANT ALL ON SCHEMA public TO public`);

    // Also clean up the drizzle schema
    await db.execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE`);

    console.log("✅ Database cleared successfully!");
  } catch (error) {
    console.error("❌ Clear failed:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

clearDatabase();

