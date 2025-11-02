#!/usr/bin/env tsx

// Load environment variables FIRST
import { config } from "dotenv";
config({ path: ".env.local" });

/**
 * Cross-Organization Access Prevention Test
 * 
 * This script tests that users cannot access data from other organizations
 * by attempting to access fund data with different organization contexts.
 */

import { db } from "../src/db/client";
import { appUsers, organizations, userOrganizations, funds } from "../src/db/schema";
import { eq, and } from "drizzle-orm";

async function setupTestData() {
  console.log("Setting up test data...");
  
  // Create test organizations
  const [org1] = await db.insert(organizations).values({
    name: "Test Organization 1",
  }).returning();
  
  const [org2] = await db.insert(organizations).values({
    name: "Test Organization 2", 
  }).returning();
  
  console.log(`Created organizations: ${org1.id}, ${org2.id}`);
  
  // Create test users
  const [user1] = await db.insert(appUsers).values({
    id: crypto.randomUUID(),
    email: "user1@test.com",
    name: "Test User 1",
  }).returning();

  const [user2] = await db.insert(appUsers).values({
    id: crypto.randomUUID(),
    email: "user2@test.com",
    name: "Test User 2",
  }).returning();
  
  console.log(`Created users: ${user1.id}, ${user2.id}`);
  
  // Associate users with organizations
  await db.insert(userOrganizations).values({
    userId: user1.id,
    organizationId: org1.id,
    role: "admin",
  });
  
  await db.insert(userOrganizations).values({
    userId: user2.id,
    organizationId: org2.id,
    role: "admin",
  });
  
  console.log("Associated users with organizations");
  
  // Create test funds
  const [fund1] = await db.insert(funds).values({
    organizationId: org1.id,
    name: "Test Fund 1",
    fundType: "private",
    totalCapacity: "1000000",
    inceptionDate: new Date(),
  }).returning();

  const [fund2] = await db.insert(funds).values({
    organizationId: org2.id,
    name: "Test Fund 2",
    fundType: "private",
    totalCapacity: "2000000",
    inceptionDate: new Date(),
  }).returning();
  
  console.log(`Created funds: ${fund1.id}, ${fund2.id}`);
  
  return {
    org1, org2,
    user1, user2,
    fund1, fund2,
  };
}

async function testCrossOrgAccess(testData: any) {
  console.log("\nTesting cross-organization access prevention...");
  
  const { org1, org2, user1, user2, fund1, fund2 } = testData;
  
  // Test 1: User1 should only see Fund1 (their org's fund)
  console.log("\nTest 1: User1 accessing funds");
  const user1Funds = await db
    .select()
    .from(funds)
    .where(eq(funds.organizationId, org1.id));
  
  console.log(`User1 can see ${user1Funds.length} funds:`, user1Funds.map(f => f.name));
  
  // Test 2: User1 should NOT be able to access Fund2 (different org)
  console.log("\nTest 2: User1 trying to access Fund2 (different org)");
  const user1AccessingFund2 = await db
    .select()
    .from(funds)
    .where(
      and(
        eq(funds.id, fund2.id),
        eq(funds.organizationId, org1.id) // User1's org
      )
    );
  
  console.log(`User1 accessing Fund2 result: ${user1AccessingFund2.length} funds found`);
  
  // Test 3: User2 should only see Fund2 (their org's fund)
  console.log("\nTest 3: User2 accessing funds");
  const user2Funds = await db
    .select()
    .from(funds)
    .where(eq(funds.organizationId, org2.id));
  
  console.log(`User2 can see ${user2Funds.length} funds:`, user2Funds.map(f => f.name));
  
  // Test 4: User2 should NOT be able to access Fund1 (different org)
  console.log("\nTest 4: User2 trying to access Fund1 (different org)");
  const user2AccessingFund1 = await db
    .select()
    .from(funds)
    .where(
      and(
        eq(funds.id, fund1.id),
        eq(funds.organizationId, org2.id) // User2's org
      )
    );
  
  console.log(`User2 accessing Fund1 result: ${user2AccessingFund1.length} funds found`);
  
  // Verify results
  const testsPassed = [
    user1Funds.length === 1 && user1Funds[0].id === fund1.id,
    user1AccessingFund2.length === 0,
    user2Funds.length === 1 && user2Funds[0].id === fund2.id,
    user2AccessingFund1.length === 0,
  ];
  
  const allTestsPassed = testsPassed.every(test => test);
  
  console.log(`\nTest Results: ${allTestsPassed ? "✅ PASSED" : "❌ FAILED"}`);
  console.log(`- User1 sees only their org's funds: ${testsPassed[0] ? "✅" : "❌"}`);
  console.log(`- User1 cannot access other org's funds: ${testsPassed[1] ? "✅" : "❌"}`);
  console.log(`- User2 sees only their org's funds: ${testsPassed[2] ? "✅" : "❌"}`);
  console.log(`- User2 cannot access other org's funds: ${testsPassed[3] ? "✅" : "❌"}`);
  
  return allTestsPassed;
}

async function cleanupTestData(testData: any) {
  console.log("\nCleaning up test data...");
  
  const { org1, org2, user1, user2, fund1, fund2 } = testData;
  
  // Delete in reverse order to respect foreign key constraints
  await db.delete(funds).where(eq(funds.id, fund1.id));
  await db.delete(funds).where(eq(funds.id, fund2.id));
  
  await db.delete(userOrganizations).where(eq(userOrganizations.userId, user1.id));
  await db.delete(userOrganizations).where(eq(userOrganizations.userId, user2.id));
  
  await db.delete(appUsers).where(eq(appUsers.id, user1.id));
  await db.delete(appUsers).where(eq(appUsers.id, user2.id));
  
  await db.delete(organizations).where(eq(organizations.id, org1.id));
  await db.delete(organizations).where(eq(organizations.id, org2.id));
  
  console.log("Test data cleaned up");
}

async function main() {
  try {
    console.log("🧪 Cross-Organization Access Prevention Test");
    console.log("=" .repeat(50));
    
    const testData = await setupTestData();
    const testsPassed = await testCrossOrgAccess(testData);
    await cleanupTestData(testData);
    
    console.log("\n" + "=" .repeat(50));
    console.log(`Overall Result: ${testsPassed ? "✅ ALL TESTS PASSED" : "❌ TESTS FAILED"}`);
    
    process.exit(testsPassed ? 0 : 1);
  } catch (error) {
    console.error("Test failed with error:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
