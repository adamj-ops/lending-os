import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function auditDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  console.log("🔍 Auditing database schema...\n");

  const connection = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(connection);

  try {
    // List all tables
    console.log("📊 ALL TABLES:");
    console.log("=".repeat(80));
    const tables: any = await db.execute(sql`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);
    tables.forEach((row: any) => console.log(`  - ${row.tablename}`));
    console.log();

    // Check for user-related tables
    console.log("👤 USER TABLES DETAILS:");
    console.log("=".repeat(80));

    const userTables = ['user', 'users', 'session', 'sessions', 'account', 'verification'];
    for (const tableName of userTables) {
      const exists: any = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = ${tableName}
        );
      `);

      if (exists[0]?.exists) {
        console.log(`\n✅ Table "${tableName}" EXISTS`);

        // Get columns
        const columns: any = await db.execute(sql`
          SELECT
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns
          WHERE table_name = ${tableName}
          ORDER BY ordinal_position;
        `);

        console.log("   Columns:");
        columns.forEach((col: any) => {
          console.log(`     - ${col.column_name}: ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ''}${col.column_default ? ` DEFAULT ${col.column_default}` : ''}`);
        });

        // Get row count
        const count: any = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM "${tableName}";`));
        console.log(`   Row count: ${count[0]?.count || 0}`);

        // Get foreign keys
        const fks: any = await db.execute(sql`
          SELECT
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
          FROM information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = ${tableName};
        `);

        if (fks.length > 0) {
          console.log("   Foreign Keys:");
          fks.forEach((fk: any) => {
            console.log(`     - ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
          });
        }
      } else {
        console.log(`\n❌ Table "${tableName}" DOES NOT EXIST`);
      }
    }

    // Check organization tables
    console.log("\n\n🏢 ORGANIZATION TABLES:");
    console.log("=".repeat(80));

    const orgTables = ['organizations', 'user_organizations', 'userOrganizations'];
    for (const tableName of orgTables) {
      const exists: any = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = ${tableName}
        );
      `);

      if (exists[0]?.exists) {
        console.log(`\n✅ Table "${tableName}" EXISTS`);

        const columns: any = await db.execute(sql`
          SELECT
            column_name,
            data_type,
            is_nullable
          FROM information_schema.columns
          WHERE table_name = ${tableName}
          ORDER BY ordinal_position;
        `);

        console.log("   Columns:");
        columns.forEach((col: any) => {
          console.log(`     - ${col.column_name}: ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ''}`);
        });

        const count: any = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM "${tableName}";`));
        console.log(`   Row count: ${count[0]?.count || 0}`);
      } else {
        console.log(`\n❌ Table "${tableName}" DOES NOT EXIST`);
      }
    }

    // Check portal access table
    console.log("\n\n🔐 PORTAL ACCESS TABLE:");
    console.log("=".repeat(80));

    const portalExists: any = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'user_portal_access'
      );
    `);

    if (portalExists[0]?.exists) {
      console.log("\n✅ Table \"user_portal_access\" EXISTS");

      const columns: any = await db.execute(sql`
        SELECT
          column_name,
          data_type
        FROM information_schema.columns
        WHERE table_name = 'user_portal_access'
        ORDER BY ordinal_position;
      `);

      console.log("   Columns:");
      columns.forEach((col: any) => {
        console.log(`     - ${col.column_name}: ${col.data_type}`);
      });

      const count: any = await db.execute(sql`SELECT COUNT(*) as count FROM user_portal_access;`);
      console.log(`   Row count: ${count[0]?.count || 0}`);
    } else {
      console.log("\n❌ Table \"user_portal_access\" DOES NOT EXIST");
    }

    console.log("\n" + "=".repeat(80));
    console.log("✅ Audit complete!");

  } catch (error) {
    console.error("❌ Audit failed:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

auditDatabase();
