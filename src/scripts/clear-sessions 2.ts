import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function clearSessions() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  console.log("🗑️  Clearing session table...");

  const connection = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(connection);

  try {
    // Delete all sessions
    await db.execute(sql`DELETE FROM session`);
    console.log("✅ All sessions cleared successfully!");
    console.log("ℹ️  Users will need to log in again.");
  } catch (error) {
    console.error("❌ Clear failed:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

clearSessions();
