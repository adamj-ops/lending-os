/**
 * Sync Existing Clerk User to App Database
 *
 * For users that already exist in Clerk but need to be synced to app_users
 *
 * Usage: npx tsx scripts/sync-existing-user.ts <email>
 */

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import { createClerkClient } from "@clerk/backend";
import { appUsers, organizations, userPortalAccess } from "../src/db/schema";
import { eq } from "drizzle-orm";

config({ path: ".env.local" });

async function syncExistingUser() {
  const email = process.argv[2];

  if (!email) {
    console.error("❌ Please provide an email address");
    console.log("Usage: npx tsx scripts/sync-existing-user.ts <email>");
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error("CLERK_SECRET_KEY environment variable is not set");
  }

  console.log("🔧 Syncing existing Clerk user to app database...");
  console.log(`📧 Email: ${email}\n`);

  const connection = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(connection, { schema });
  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

  try {
    // Step 1: Find user in Clerk
    console.log("Step 1: Finding user in Clerk...");
    const existingUsers = await clerk.users.getUserList({
      emailAddress: [email],
    });

    if (existingUsers.data.length === 0) {
      throw new Error(`User with email ${email} not found in Clerk`);
    }

    const clerkUser = existingUsers.data[0];
    console.log(`✅ Found user in Clerk (ID: ${clerkUser.id})`);

    // Step 2: Sync to app_users
    console.log("\nStep 2: Syncing to app_users...");

    const firstName = clerkUser.firstName || "User";
    const lastName = clerkUser.lastName || "";
    const fullName = [firstName, lastName].filter(Boolean).join(" ");

    await db.insert(appUsers).values({
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0].emailAddress,
      name: fullName,
      firstName: firstName,
      lastName: lastName,
      imageUrl: clerkUser.imageUrl,
    }).onConflictDoUpdate({
      target: appUsers.id,
      set: {
        email: clerkUser.emailAddresses[0].emailAddress,
        name: fullName,
        firstName: firstName,
        lastName: lastName,
        imageUrl: clerkUser.imageUrl,
        updatedAt: new Date(),
      }
    });

    console.log("✅ User synced to app_users");

    // Step 3: Find or create Dev Organization
    console.log("\nStep 3: Setting up organization...");

    let org = await db.query.organizations.findFirst({
      where: eq(organizations.name, "Dev Organization"),
    });

    if (!org) {
      console.log("Creating Dev Organization...");
      const [newOrg] = await db.insert(organizations).values({
        name: "Dev Organization",
        logoUrl: null,
      }).returning();
      org = newOrg;
      console.log(`✅ Created organization (ID: ${org.id})`);
    } else {
      console.log(`✓ Organization already exists (ID: ${org.id})`);
    }

    // Step 4: Assign portal access
    console.log("\nStep 4: Assigning portal access...");

    const existingAccess = await db.query.userPortalAccess.findFirst({
      where: eq(userPortalAccess.userId, clerkUser.id),
    });

    if (!existingAccess) {
      await db.insert(userPortalAccess).values({
        userId: clerkUser.id,
        organizationId: org.id,
        portalType: "ops",
        role: "admin",
        isActive: true,
      });
      console.log("✅ Portal access assigned (ops/admin)");
    } else {
      console.log(`✓ Portal access already exists (${existingAccess.portalType}/${existingAccess.role})`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ USER SYNC COMPLETE!");
    console.log("=".repeat(60));
    console.log(`\n📧 Email: ${email}`);
    console.log(`🏢 Organization: Dev Organization (${org.id})`);
    console.log(`👤 Clerk User ID: ${clerkUser.id}`);
    console.log("\n🚀 You can now log in at:");
    console.log("   http://localhost:3000/auth/v2/login\n");

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    throw error;
  } finally {
    await connection.end();
  }
}

syncExistingUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
