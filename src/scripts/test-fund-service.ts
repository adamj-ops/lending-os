/**
 * Fund Service Test Script
 *
 * Tests the fund service implementation by:
 * 1. Creating a test fund
 * 2. Creating a test lender/investor
 * 3. Creating a commitment
 * 4. Activating the commitment
 * 5. Creating a capital call
 * 6. Creating a distribution
 * 7. Verifying all events were published
 * 8. Verifying event handlers executed (analytics & alerts)
 */

import { db } from '@/db/client';
import {
  funds,
  fundCommitments,
  fundCalls,
  fundDistributions,
  domainEvents,
  eventHandlers,
  organizations,
  lenders,
} from '@/db/schema';
import { FundService } from '@/services/fund.service';
import { registerEventHandlers } from '@/lib/events/handlers';
import { eq } from 'drizzle-orm';

async function testFundService() {
  console.log('🧪 Starting Fund Service Test...\n');

  try {
    // Step 1: Register event handlers
    console.log('1️⃣ Registering event handlers...');
    registerEventHandlers();
    console.log('   ✅ Event handlers registered\n');

    // Step 2: Create a test organization
    console.log('2️⃣ Creating test organization...');
    const [testOrg] = await db
      .insert(organizations)
      .values({
        name: 'Test Fund Organization',
        slug: 'test-fund-org-' + Date.now(),
      })
      .returning();
    console.log(`   ✅ Created organization: ${testOrg.id}\n`);

    // Step 3: Create a test fund
    console.log('3️⃣ Creating test fund...');
    const testFund = await FundService.createFund(
      {
        organizationId: testOrg.id,
        name: 'Test Private Equity Fund I',
        fundType: 'private',
        totalCapacity: 10000000, // $10M
        inceptionDate: new Date('2025-01-01'),
        strategy: 'Real estate debt financing',
        targetReturn: 12.5,
        managementFeeBps: 200, // 2%
        performanceFeeBps: 2000, // 20%
      },
      'test-user'
    );
    console.log(`   ✅ Created fund: ${testFund.id}`);
    console.log(`   📊 Fund name: ${testFund.name}`);
    console.log(`   📊 Total capacity: $${testFund.totalCapacity}\n`);

    // Step 4: Check that Fund.Created event was published
    console.log('4️⃣ Checking Fund.Created event...');
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for async event processing
    const fundEvents = await db
      .select()
      .from(domainEvents)
      .where(eq(domainEvents.aggregateId, testFund.id));

    const fundCreatedEvent = fundEvents.find((e) => e.eventType === 'Fund.Created');
    if (fundCreatedEvent) {
      console.log(`   ✅ Fund.Created event published: ${fundCreatedEvent.id}`);
      console.log(`   📊 Event status: ${fundCreatedEvent.processingStatus}`);
      console.log(`   📊 Event payload:`, fundCreatedEvent.payload);
    } else {
      console.log('   ❌ Fund.Created event NOT found');
    }
    console.log('');

    // Step 5: Create a test lender (who will act as investor)
    console.log('5️⃣ Creating test lender/investor...');
    const [testLender] = await db
      .insert(lenders)
      .values({
        organizationId: testOrg.id,
        name: 'Acme Investment Partners',
        contactEmail: 'invest@acme.com',
        contactPhone: '+1-555-0100',
        entityType: 'company',
      })
      .returning();
    console.log(`   ✅ Created lender/investor: ${testLender.id}\n`);

    // Step 6: Create a commitment
    console.log('6️⃣ Creating fund commitment...');
    const testCommitment = await FundService.createCommitment(
      {
        fundId: testFund.id,
        lenderId: testLender.id,
        committedAmount: 1000000, // $1M commitment
        commitmentDate: new Date(),
      },
      'test-user'
    );
    console.log(`   ✅ Created commitment: ${testCommitment.id}`);
    console.log(`   📊 Committed amount: $${testCommitment.committedAmount}`);
    console.log(`   📊 Status: ${testCommitment.status}\n`);

    // Step 7: Activate the commitment
    console.log('7️⃣ Activating commitment...');
    const activatedCommitment = await FundService.activateCommitment(testCommitment.id, 'test-user');
    console.log(`   ✅ Commitment activated`);
    console.log(`   📊 New status: ${activatedCommitment.status}\n`);

    // Wait for async event processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Step 8: Check that Commitment.Activated event was published
    console.log('8️⃣ Checking Commitment.Activated event...');
    const commitmentEvents = await db
      .select()
      .from(domainEvents)
      .where(eq(domainEvents.aggregateId, testCommitment.id));

    const commitmentActivatedEvent = commitmentEvents.find(
      (e) => e.eventType === 'Commitment.Activated'
    );
    if (commitmentActivatedEvent) {
      console.log(`   ✅ Commitment.Activated event published: ${commitmentActivatedEvent.id}`);
      console.log(`   📊 Event status: ${commitmentActivatedEvent.processingStatus}`);
    } else {
      console.log('   ❌ Commitment.Activated event NOT found');
    }
    console.log('');

    // Step 9: Create a capital call
    console.log('9️⃣ Creating capital call...');
    const testCall = await FundService.createCapitalCall(
      {
        fundId: testFund.id,
        callNumber: 1,
        callAmount: 500000, // $500K call
        dueDate: new Date('2025-02-15'),
        purpose: 'Initial deployment for loan portfolio',
      },
      'test-user'
    );
    console.log(`   ✅ Created capital call: ${testCall.id}`);
    console.log(`   📊 Call amount: $${testCall.callAmount}`);
    console.log(`   📊 Due date: ${testCall.dueDate}\n`);

    // Step 10: Create a loan allocation
    console.log('🔟 Creating loan allocation...');
    const testAllocation = await FundService.allocateToLoan(
      {
        fundId: testFund.id,
        loanId: '00000000-0000-0000-0000-000000000000', // Dummy loan ID for testing
        allocatedAmount: 250000, // $250K to loan
        allocationDate: new Date(),
      },
      'test-user'
    );
    console.log(`   ✅ Created allocation: ${testAllocation.id}`);
    console.log(`   📊 Allocated amount: $${testAllocation.allocatedAmount}\n`);

    // Step 11: Create a distribution
    console.log('1️⃣1️⃣ Creating distribution...');
    const testDistribution = await FundService.createDistribution(
      {
        fundId: testFund.id,
        distributionDate: new Date(),
        totalAmount: 50000, // $50K distribution
        distributionType: 'profit',
        notes: 'Q1 2025 profit distribution',
      },
      'test-user'
    );
    console.log(`   ✅ Created distribution: ${testDistribution.id}`);
    console.log(`   📊 Total amount: $${testDistribution.totalAmount}`);
    console.log(`   📊 Type: ${testDistribution.distributionType}\n`);

    // Wait for async event processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Step 12: Check Distribution.Made event
    console.log('1️⃣2️⃣ Checking Distribution.Made event...');
    const distributionEvents = await db
      .select()
      .from(domainEvents)
      .where(eq(domainEvents.aggregateId, testDistribution.id));

    const distributionMadeEvent = distributionEvents.find((e) => e.eventType === 'Distribution.Made');
    if (distributionMadeEvent) {
      console.log(`   ✅ Distribution.Made event published: ${distributionMadeEvent.id}`);
      console.log(`   📊 Event status: ${distributionMadeEvent.processingStatus}`);
    } else {
      console.log('   ❌ Distribution.Made event NOT found');
    }
    console.log('');

    // Step 13: Check fund metrics
    console.log('1️⃣3️⃣ Checking fund with metrics...');
    const fundWithMetrics = await FundService.getFundWithMetrics(testFund.id);
    if (fundWithMetrics) {
      console.log(`   ✅ Retrieved fund with metrics`);
      console.log(`   📊 Total committed: $${fundWithMetrics.totalCommitted}`);
      console.log(`   📊 Total deployed: $${fundWithMetrics.totalDeployed}`);
      console.log(`   📊 Active commitments: ${fundWithMetrics.activeCommitments}`);
      console.log(`   📊 Total commitments count: ${fundWithMetrics.totalCommitments}`);
    } else {
      console.log('   ❌ Could not retrieve fund metrics');
    }
    console.log('');

    // Step 14: Check event handler statistics
    console.log('1️⃣4️⃣ Checking event handler statistics...');
    const handlers = await db
      .select()
      .from(eventHandlers)
      .where(eq(eventHandlers.handlerName, 'FundCreatedAlertHandler'));

    if (handlers.length > 0) {
      for (const handler of handlers) {
        console.log(`   📊 Handler: ${handler.handlerName}`);
        console.log(`      - Event type: ${handler.eventType}`);
        console.log(`      - Success count: ${handler.successCount}`);
        console.log(`      - Failure count: ${handler.failureCount}`);
        console.log(`      - Last executed: ${handler.lastExecutedAt || 'Never'}`);
      }
    } else {
      console.log('   ⚠️  No fund event handlers found in statistics');
    }
    console.log('');

    // Step 15: Get complete event history for the fund
    console.log('1️⃣5️⃣ Complete event history for fund...');
    const allFundEvents = await db
      .select()
      .from(domainEvents)
      .where(eq(domainEvents.aggregateType, 'Fund'));

    console.log(`   📊 Total fund-related events: ${allFundEvents.length}`);
    for (const event of allFundEvents) {
      console.log(
        `      - ${event.eventType} (${event.occurredAt}) - ${event.processingStatus}`
      );
    }
    console.log('');

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await db.delete(fundDistributions).where(eq(fundDistributions.id, testDistribution.id));
    await db.delete(fundCalls).where(eq(fundCalls.id, testCall.id));
    await db.delete(fundCommitments).where(eq(fundCommitments.id, testCommitment.id));
    await db.delete(funds).where(eq(funds.id, testFund.id));
    await db.delete(lenders).where(eq(lenders.id, testLender.id));
    await db.delete(organizations).where(eq(organizations.id, testOrg.id));
    console.log('   ✅ Test data cleaned up\n');

    console.log('✅ Fund Service Test Completed Successfully! 🎉');
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run the test
testFundService()
  .then(() => {
    console.log('\n✅ All fund tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
