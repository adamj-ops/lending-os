import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function fixSessionTable() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  console.log("🔧 Fixing session table schema...");

  const connection = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(connection);

  try {
    // Check if updated_at column exists and has a default
    const result: any = await db.execute(sql`
      SELECT column_default
      FROM information_schema.columns
      WHERE table_name = 'session' AND column_name = 'updated_at';
    `);

    console.log("Current updated_at default:", result?.[0]?.column_default || "NONE");

    // Add default to updated_at if missing
    console.log("Setting default value for updated_at column...");
    await db.execute(sql`
      ALTER TABLE session
      ALTER COLUMN updated_at SET DEFAULT NOW();
    `);

    console.log("✅ Session table fixed successfully!");
    console.log("ℹ️  New sessions will be created correctly now.");
  } catch (error) {
    console.error("❌ Fix failed:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

fixSessionTable();
