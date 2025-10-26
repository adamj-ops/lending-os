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
    // Clear all tables in order (respecting foreign key constraints)
    await db.execute(sql`TRUNCATE loans CASCADE`);
    await db.execute(sql`TRUNCATE user_organizations CASCADE`);
    await db.execute(sql`TRUNCATE sessions CASCADE`);
    await db.execute(sql`TRUNCATE users CASCADE`);
    await db.execute(sql`TRUNCATE organizations CASCADE`);

    console.log("✅ Database cleared successfully!");
  } catch (error) {
    console.error("❌ Clear failed:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

clearDatabase();

