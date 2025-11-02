/**
 * Phase 1.3: Map Existing Clerk Users to Legacy IDs
 * 
 * This script maps users that already exist in both Clerk and the legacy user table.
 * It creates entries in the user_id_mapping table for all users not yet mapped.
 * 
 * PREREQUISITES:
 * - Migration 001_create_user_id_mapping.sql must be run
 * - Script 01-import-legacy-users-to-clerk.ts should be run first
 * - CLERK_SECRET_KEY must be set in environment
 * 
 * EXECUTION ORDER: Run this THIRD (after script 01)
 */

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../src/db/schema";
import { createClerkClient } from "@clerk/backend";
import { eq } from "drizzle-orm";

config({ path: ".env.local" });

interface MappingStats {
  total: number;
  alreadyMapped: number;
  newlyMapped: number;
  notFoundInClerk: number;
  failed: number;
  unmappedEmails: string[];
}

async function mapLegacyToClerkIds() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error("CLERK_SECRET_KEY environment variable is not set");
  }

  console.log("🔧 Phase 1.3: Mapping legacy IDs to Clerk IDs...\n");

  const connection = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(connection, { schema });
  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

  const stats: MappingStats = {
    total: 0,
    alreadyMapped: 0,
    newlyMapped: 0,
    notFoundInClerk: 0,
    failed: 0,
    unmappedEmails: [],
  };

  try {
    // Check prerequisites
    const mappingTableExists = await connection`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_id_mapping'
      );
    `;

    if (!mappingTableExists[0].exists) {
      throw new Error("user_id_mapping table does not exist. Run migration 001 first.");
    }

    // Fetch all legacy users (table is still called 'user' until migration 002)
    const legacyUsersResult = await connection`SELECT * FROM "user"`;
    stats.total = legacyUsersResult.length;

    console.log(`Found ${stats.total} users in legacy user table\n`);

    for (const legacyUser of legacyUsersResult) {
      try {
        // Check if already mapped
        const existingMapping = await connection`
          SELECT * FROM user_id_mapping WHERE legacy_id = ${legacyUser.id} LIMIT 1
        `;

        if (existingMapping.length > 0) {
          console.log(`⏭️  ${legacyUser.email} - already mapped`);
          stats.alreadyMapped++;
          continue;
        }

        // Look up in Clerk by email
        console.log(`Looking up ${legacyUser.email} in Clerk...`);
        const clerkUsers = await clerk.users.getUserList({
          emailAddress: [legacyUser.email],
        });

        if (clerkUsers.data.length === 0) {
          console.warn(`⚠️  ${legacyUser.email} - not found in Clerk`);
          stats.notFoundInClerk++;
          stats.unmappedEmails.push(legacyUser.email);
          continue;
        }

        // Found in Clerk - create mapping
        const clerkUser = clerkUsers.data[0];
        await connection`
          INSERT INTO user_id_mapping (legacy_id, clerk_id, email)
          VALUES (${legacyUser.id}, ${clerkUser.id}, ${legacyUser.email})
          ON CONFLICT (legacy_id) DO NOTHING
        `;

        console.log(`✅ ${legacyUser.email} - mapped: ${legacyUser.id} → ${clerkUser.id}`);
        stats.newlyMapped++;

      } catch (error: any) {
        console.error(`❌ Failed to process ${legacyUser.email}:`, error.message);
        stats.failed++;
      }
    }

    // Verify mapping completeness
    const mappingCount = await connection`SELECT COUNT(*) FROM user_id_mapping`;
    const expectedCount = stats.total - stats.notFoundInClerk;

    console.log("\n" + "=".repeat(60));
    console.log("MAPPING SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total legacy users:        ${stats.total}`);
    console.log(`Already mapped:            ${stats.alreadyMapped}`);
    console.log(`Newly mapped:              ${stats.newlyMapped}`);
    console.log(`Not found in Clerk:        ${stats.notFoundInClerk}`);
    console.log(`Failed:                    ${stats.failed}`);
    console.log(`\nTotal mappings in DB:      ${mappingCount[0].count}`);
    console.log(`Expected mappings:         ${expectedCount}`);

    if (stats.unmappedEmails.length > 0) {
      console.log("\n⚠️  Unmapped users (not found in Clerk):");
      stats.unmappedEmails.forEach(email => console.log(`  - ${email}`));
      console.log("\nThese users should have been created in script 01.");
      console.log("You may need to run script 01 again or investigate these accounts.");
    }

    if (mappingCount[0].count < expectedCount) {
      throw new Error(
        `Mapping incomplete! Expected ${expectedCount} mappings, found ${mappingCount[0].count}`
      );
    }

    console.log("\n✅ Phase 1.3 complete!");
    console.log("Next step: Run script 03-backfill-app-users.ts\n");

  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

mapLegacyToClerkIds()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
