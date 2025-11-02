/**
 * Complete dev setup: Creates BetterAuth organization and assigns portal access
 * This ensures the dev user can actually log in and access the dashboard
 */

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";

config({ path: ".env.local" });

async function completeDevSetup() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  console.log("🔧 Completing dev setup...");

  const connection = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(connection, { schema });

  try {
    // Find dev user
    const [devUser] = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.email, "dev@lendingos.com"))
      .limit(1);

    if (!devUser) {
      console.log("❌ Dev user not found. Run create-dev-user.ts first.");
      process.exit(1);
    }

    console.log(`✅ Found dev user: ${devUser.email} (${devUser.id})`);

    // Check if BetterAuth organization table exists
    const orgTableCheck = await connection`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'organization'
      );
    `;

    let orgId: string;

    if (orgTableCheck[0].exists) {
      console.log("✅ BetterAuth organization table exists");

      // Check if organization already exists
      const existingOrg = await connection`
        SELECT id, name FROM organization WHERE name = 'Dev Organization' LIMIT 1;
      `;

      if (existingOrg.length > 0) {
        orgId = existingOrg[0].id;
        console.log(`✅ Using existing organization: ${existingOrg[0].name} (${orgId})`);
      } else {
        // Create BetterAuth organization
        console.log("Creating BetterAuth organization...");
        const newOrg = await connection`
          INSERT INTO organization (id, name, slug, logo, created_at, updated_at)
          VALUES (gen_random_uuid(), 'Dev Organization', 'dev-org', NULL, NOW(), NOW())
          RETURNING id, name;
        `;
        orgId = newOrg[0].id;
        console.log(`✅ Created organization: ${newOrg[0].name} (${orgId})`);
      }

      // Add user as member if not already
      const existingMember = await connection`
        SELECT * FROM member 
        WHERE user_id = ${devUser.id} AND organization_id = ${orgId}
        LIMIT 1;
      `;

      if (existingMember.length === 0) {
        console.log("Adding user to organization as admin...");
        await connection`
          INSERT INTO member (id, user_id, organization_id, role, created_at, updated_at)
          VALUES (gen_random_uuid(), ${devUser.id}, ${orgId}, 'admin', NOW(), NOW());
        `;
        console.log("✅ User added to organization");
      } else {
        console.log("✅ User already a member");
      }
    } else {
      console.log("⚠️  BetterAuth organization table doesn't exist.");
      console.log("   Creating portal access with legacy organization ID...");
      
      // Fallback: use legacy organization
      const [legacyOrg] = await db
        .select()
        .from(schema.organizations)
        .limit(1);

      if (!legacyOrg) {
        console.log("Creating legacy organization...");
        const [newLegacyOrg] = await db
          .insert(schema.organizations)
          .values({
            name: "Dev Organization",
            logoUrl: null,
          })
          .returning();
        orgId = newLegacyOrg.id;
      } else {
        orgId = legacyOrg.id;
      }

      // Link to legacy organization
      await db.insert(schema.userOrganizations).values({
        userId: devUser.id,
        organizationId: orgId,
        role: "admin",
      }).onConflictDoNothing();
    }

    // Ensure portal access exists
    console.log("Setting up portal access...");
    const existingPortalAccess = await db
      .select()
      .from(schema.userPortalAccess)
      .where(
        and(
          eq(schema.userPortalAccess.userId, devUser.id),
          eq(schema.userPortalAccess.organizationId, orgId),
          eq(schema.userPortalAccess.portalType, "ops")
        )
      )
      .limit(1);

    if (existingPortalAccess.length === 0) {
      await db.insert(schema.userPortalAccess).values({
        userId: devUser.id,
        organizationId: orgId,
        portalType: "ops",
        role: "admin",
        isActive: true,
      });
      console.log("✅ Portal access created");
    } else {
      // Update existing to ensure it's active
      await db
        .update(schema.userPortalAccess)
        .set({
          isActive: true,
          role: "admin",
        })
        .where(eq(schema.userPortalAccess.id, existingPortalAccess[0].id));
      console.log("✅ Portal access updated");
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ DEV SETUP COMPLETE!");
    console.log("=".repeat(50));
    console.log("\n📧 Email: dev@lendingos.com");
    console.log("🔑 Password: dev123");
    console.log(`🏢 Organization ID: ${orgId}`);
    console.log("\n🚀 You can now log in at:");
    console.log("   http://localhost:3000/auth/v2/login");
    console.log("\n");

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

completeDevSetup()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

