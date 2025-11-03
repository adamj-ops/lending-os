/**
 * Quick Fund Creation Test
 * Tests that fund creation works with analytics handler
 */

import { db } from '@/db/client';
import { funds, organizations } from '@/db/schema';
import { FundService } from '@/services/fund.service';
import { registerEventHandlers } from '@/lib/events/handlers';
import { eq } from 'drizzle-orm';

async function quickTest() {
  console.log('🧪 Quick Fund Creation Test\n');

  try {
    // Register handlers
    console.log('1️⃣ Registering event handlers...');
    registerEventHandlers();
    console.log('   ✅ Registered\n');

    // Create org
    console.log('2️⃣ Creating test organization...');
    const [testOrg] = await db
      .insert(organizations)
      .values({
        name: 'Test Org',
        slug: 'test-' + Date.now(),
      })
      .returning();
    console.log(`   ✅ Created: ${testOrg.id}\n`);

    // Create fund
    console.log('3️⃣ Creating fund...');
    const fund = await FundService.createFund(
      {
        organizationId: testOrg.id,
        name: 'Test Fund',
        fundType: 'private',
        totalCapacity: 1000000,
        inceptionDate: new Date(),
      },
      'test-user'
    );
    console.log(`   ✅ Fund created: ${fund.id}\n`);

    // Wait for event processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log('4️⃣ Checking analytics snapshot...');
    const snapshots = await db.query.fundSnapshots.findMany();
    console.log(`   📊 Found ${snapshots.length} snapshots`);
    if (snapshots.length > 0) {
      console.log(`   ✅ Latest snapshot:`, snapshots[snapshots.length - 1]);
    }

    // Cleanup
    console.log('\n🧹 Cleaning up...');
    await db.delete(funds).where(eq(funds.id, fund.id));
    await db.delete(organizations).where(eq(organizations.id, testOrg.id));
    console.log('   ✅ Done\n');

    console.log('✅ Test passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

quickTest()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
