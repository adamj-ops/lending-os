/**
 * Assign (or update) portal access for a Clerk-backed user.
 *
 * Usage:
 *   npx tsx scripts/assign-portal-access.ts <email> <portalType> <role> <organizationId>
 *   portalType -> ops | investor | borrower
 *   role       -> defaults to admin when omitted
 */

import { config } from "dotenv";
import { eq, and } from "drizzle-orm";

import { db } from "../src/db/client";
import { appUsers, userPortalAccess } from "../src/db/schema";

config({ path: ".env.local" });

async function assignPortalAccess(
  email: string,
  portalType: "ops" | "investor" | "borrower",
  role: string,
  organizationId: string,
) {
  // Pull user from app_users (already synced from Clerk)
  const user = await db.query.appUsers.findFirst({
    where: eq(appUsers.email, email),
  });

  if (!user) {
    throw new Error(`User with email ${email} not found in app_users. Run the bootstrap script first.`);
  }

  const existingAccess = await db.query.userPortalAccess.findFirst({
    where: and(
      eq(userPortalAccess.userId, user.id),
      eq(userPortalAccess.organizationId, organizationId),
      eq(userPortalAccess.portalType, portalType),
    ),
  });

  if (existingAccess) {
    await db
      .update(userPortalAccess)
      .set({
        role,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(userPortalAccess.id, existingAccess.id));

    console.log(`✅ Updated portal access for ${email}: ${portalType} / ${role}`);
  } else {
    await db.insert(userPortalAccess).values({
      userId: user.id,
      organizationId,
      portalType,
      role,
      isActive: true,
    });

    console.log(`✅ Created portal access for ${email}: ${portalType} / ${role}`);
  }
}

async function run() {
  const email = process.argv[2];
  const portalType = process.argv[3] as "ops" | "investor" | "borrower";
  const role = (process.argv[4] ?? "admin").toLowerCase();
  const organizationId = process.argv[5];

  if (!email || !portalType || !organizationId) {
    console.error("Usage: npx tsx scripts/assign-portal-access.ts <email> <portalType> <role> <organizationId>");
    process.exit(1);
  }

  if (!["ops", "investor", "borrower"].includes(portalType)) {
    console.error("portalType must be one of: ops, investor, borrower");
    process.exit(1);
  }

  await assignPortalAccess(email, portalType, role, organizationId);

  console.log("\n🎯 Done!");
  console.log(`User:  ${email}`);
  console.log(`Org:   ${organizationId}`);
  console.log(`Portal ${portalType} (${role})`);
}

run().catch((err) => {
  console.error("❌ Failed to assign portal access:", err);
  process.exit(1);
});
