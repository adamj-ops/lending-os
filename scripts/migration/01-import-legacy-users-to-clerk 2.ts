/**
 * Phase 1.2: Import Legacy-Only Users to Clerk
 * 
 * This script imports users that exist in the legacy user table but NOT in Clerk.
 * It creates Clerk accounts for them and records the ID mapping.
 * 
 * PREREQUISITES:
 * - Migration 001_create_user_id_mapping.sql must be run first
 * - CLERK_SECRET_KEY must be set in environment
 * 
 * EXECUTION ORDER: Run this SECOND (after migration 001)
 */

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../src/db/schema";
import { createClerkClient } from "@clerk/backend";

config({ path: ".env.local" });

interface ImportStats {
  total: number;
  alreadyInClerk: number;
  created: number;
  failed: number;
  failedEmails: string[];
}

async function importLegacyUsers() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error("CLERK_SECRET_KEY environment variable is not set");
  }

  console.log("🔧 Phase 1.2: Importing legacy users to Clerk...\n");

  const connection = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(connection, { schema });
  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

  const stats: ImportStats = {
    total: 0,
    alreadyInClerk: 0,
    created: 0,
    failed: 0,
    failedEmails: [],
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
        // Check if already mapped (from previous run)
        const existingMapping = await connection`
          SELECT * FROM user_id_mapping WHERE legacy_id = ${legacyUser.id} LIMIT 1
        `;

        if (existingMapping.length > 0) {
          console.log(`⏭️  ${legacyUser.email} - already mapped, skipping`);
          stats.alreadyInClerk++;
          continue;
        }

        // Check if exists in Clerk by email
        const clerkUsers = await clerk.users.getUserList({
          emailAddress: [legacyUser.email],
        });

        if (clerkUsers.data.length > 0) {
          // User exists in Clerk - record mapping (will be done in script 02)
          console.log(`✓ ${legacyUser.email} - exists in Clerk, will map in next step`);
          stats.alreadyInClerk++;
          continue;
        }

        // User doesn't exist in Clerk - create account
        console.log(`Creating Clerk account for ${legacyUser.email}...`);
        
        const nameParts = legacyUser.name.split(" ");
        const firstName = nameParts[0] || "User";
        const lastName = nameParts.slice(1).join(" ") || "";

        const clerkUser = await clerk.users.createUser({
          emailAddress: [legacyUser.email],
          firstName,
          lastName: lastName || undefined,
          skipPasswordRequirement: true, // User must reset password on first login
          skipPasswordChecks: true,
        });

        // Record mapping
        await connection`
          INSERT INTO user_id_mapping (legacy_id, clerk_id, email)
          VALUES (${legacyUser.id}, ${clerkUser.id}, ${legacyUser.email})
        `;

        console.log(`✅ ${legacyUser.email} - created in Clerk (${clerkUser.id})`);
        stats.created++;

      } catch (error: any) {
        console.error(`❌ Failed to process ${legacyUser.email}:`, error.message);
        stats.failed++;
        stats.failedEmails.push(legacyUser.email);
      }
    }

    // Print summary
    console.log("\n" + "=".repeat(60));
    console.log("IMPORT SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total legacy users:        ${stats.total}`);
    console.log(`Already in Clerk:          ${stats.alreadyInClerk}`);
    console.log(`Created in Clerk:          ${stats.created}`);
    console.log(`Failed:                    ${stats.failed}`);

    if (stats.failedEmails.length > 0) {
      console.log("\nFailed emails:");
      stats.failedEmails.forEach(email => console.log(`  - ${email}`));
    }

    console.log("\n✅ Phase 1.2 complete!");
    console.log("Next step: Run script 02-map-legacy-to-clerk-ids.ts\n");

  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

importLegacyUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
