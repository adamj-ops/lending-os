import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";

config({ path: ".env.local" });

async function checkLatestSession() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const connection = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(connection);

  try {
    console.log("🔍 Checking latest sessions...\n");

    const sessions: any = await db.execute(sql`
      SELECT s.id, s.token, s.created_at, s.expires_at, s.user_id, u.email
      FROM session s
      JOIN "user" u ON s.user_id = u.id
      ORDER BY s.created_at DESC
      LIMIT 5;
    `);

    if (sessions.length === 0) {
      console.log("❌ No sessions found in database");
    } else {
      console.log(`✅ Found ${sessions.length} recent session(s):\n`);
      sessions.forEach((session: any, index: number) => {
        console.log(`Session ${index + 1}:`);
        console.log(`  - ID: ${session.id}`);
        console.log(`  - Token: ${session.token}`);
        console.log(`  - User: ${session.email}`);
        console.log(`  - Created: ${session.created_at}`);
        console.log(`  - Expires: ${session.expires_at}`);
        console.log();
      });
    }

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await connection.end();
  }
}

checkLatestSession();
