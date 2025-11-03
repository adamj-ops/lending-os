import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";

config({ path: ".env.local" });

async function fixAndTestSession() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  console.log("🔧 Fixing and testing session table...\n");

  const connection = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(connection);

  try {
    // Step 1: Check current schema
    console.log("📊 Step 1: Checking current session table schema");
    const columns: any = await db.execute(sql`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'session'
      ORDER BY ordinal_position;
    `);

    console.log("Current columns:");
    columns.forEach((col: any) => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });

    // Step 2: Drop and recreate session table with correct schema
    console.log("\n📊 Step 2: Recreating session table with correct schema");

    await db.execute(sql`DROP TABLE IF EXISTS session CASCADE;`);
    console.log("  ✅ Dropped old session table");

    await db.execute(sql`
      CREATE TABLE session (
        id TEXT PRIMARY KEY,
        expires_at TIMESTAMP NOT NULL,
        token TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        ip_address TEXT,
        user_agent TEXT,
        user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
      );
    `);
    console.log("  ✅ Created new session table with proper defaults");

    // Step 3: Verify the new schema
    console.log("\n📊 Step 3: Verifying new schema");
    const newColumns: any = await db.execute(sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'session'
      ORDER BY ordinal_position;
    `);

    console.log("New columns:");
    newColumns.forEach((col: any) => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.column_default ? `DEFAULT ${col.column_default}` : 'NO DEFAULT'}`);
    });

    // Step 4: Test session creation
    console.log("\n📊 Step 4: Testing session creation");

    // Get a test user
    const users: any = await db.execute(sql`SELECT id FROM "user" LIMIT 1;`);
    if (users.length === 0) {
      console.log("  ⚠️  No users found - skipping session test");
    } else {
      const testUserId = users[0].id;
      const testSessionId = `session_test_${Date.now()}`;
      const testToken = `token_test_${Date.now()}`;

      // Insert test session
      await db.execute(sql`
        INSERT INTO session (id, expires_at, token, user_id)
        VALUES (
          ${testSessionId},
          NOW() + INTERVAL '7 days',
          ${testToken},
          ${testUserId}
        );
      `);
      console.log(`  ✅ Created test session: ${testSessionId}`);

      // Query it back
      const result: any = await db.execute(sql`
        SELECT * FROM session WHERE id = ${testSessionId};
      `);

      if (result.length > 0) {
        console.log("  ✅ Successfully queried session back");
        console.log(`     - id: ${result[0].id}`);
        console.log(`     - created_at: ${result[0].created_at}`);
        console.log(`     - updated_at: ${result[0].updated_at}`);
        console.log(`     - user_id: ${result[0].user_id}`);
      }

      // Clean up test session
      await db.execute(sql`DELETE FROM session WHERE id = ${testSessionId};`);
      console.log("  ✅ Cleaned up test session");
    }

    console.log("\n✅ Session table fix complete!");
    console.log("ℹ️  Try logging in now.");

  } catch (error) {
    console.error("❌ Fix failed:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

fixAndTestSession();
