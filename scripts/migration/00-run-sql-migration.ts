/**
 * Helper script to run SQL migration files
 * 
 * Usage: npx tsx scripts/migration/00-run-sql-migration.ts <migration-file>
 */

import { config } from "dotenv";
import postgres from "postgres";
import { readFileSync } from "fs";
import { resolve } from "path";

config({ path: ".env.local" });

async function runSqlMigration() {
  const migrationFile = process.argv[2];
  
  if (!migrationFile) {
    console.error("Usage: npx tsx scripts/migration/00-run-sql-migration.ts <migration-file>");
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  console.log(`🔧 Running SQL migration: ${migrationFile}...\n`);

  const connection = postgres(process.env.DATABASE_URL, { max: 1 });

  try {
    // Read the SQL file
    const sqlPath = resolve(process.cwd(), migrationFile);
    const sql = readFileSync(sqlPath, 'utf-8');

    console.log(`Executing SQL from: ${sqlPath}`);
    console.log(`SQL length: ${sql.length} characters\n`);

    // Execute the SQL
    await connection.unsafe(sql);

    console.log("✅ Migration completed successfully!\n");

  } catch (error: any) {
    console.error("❌ Error running migration:", error.message);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    throw error;
  } finally {
    await connection.end();
  }
}

runSqlMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

