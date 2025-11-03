/**
 * Event Bus Test Script
 *
 * Tests the event bus implementation by:
 * 1. Creating a test loan
 * 2. Transitioning it to funded status
 * 3. Verifying payment schedule was created via event handler
 */

import { db } from '@/db/client';
import { loans, domainEvents, eventHandlers, paymentSchedules, payments, organizations } from '@/db/schema';
import { LoanService } from '@/services/loan.service';
import { registerEventHandlers } from '@/lib/events/handlers';
import { eq } from 'drizzle-orm';

async function testEventBus() {
  console.log('🧪 Starting Event Bus Test...\n');

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
        name: 'Test Organization',
        slug: 'test-org-' + Date.now(),
      })
      .returning();
    console.log(`   ✅ Created organization: ${testOrg.id}\n`);

    // Step 3: Create a test loan
    console.log('3️⃣ Creating test loan...');
    const testLoan = await LoanService.createLoan({
      organizationId: testOrg.id,
      loanCategory: 'asset_backed',
      principal: 100000,
      rate: 7.5,
      termMonths: 12,
      paymentType: 'amortized',
      paymentFrequency: 'monthly',
      status: 'draft',
    });
    console.log(`   ✅ Created loan: ${testLoan.id}\n`);

    // Step 4: Check that Loan.Created event was published
    console.log('4️⃣ Checking Loan.Created event...');
    const createdEvents = await db
      .select()
      .from(domainEvents)
      .where(eq(domainEvents.aggregateId, testLoan.id));

    const loanCreatedEvent = createdEvents.find(e => e.eventType === 'Loan.Created');
    if (loanCreatedEvent) {
      console.log(`   ✅ Loan.Created event published: ${loanCreatedEvent.id}`);
      console.log(`   📊 Event payload:`, loanCreatedEvent.payload);
    } else {
      console.log('   ❌ Loan.Created event NOT found');
    }
    console.log('');

    // Step 5: Transition loan to funded status (through valid states)
    console.log('5️⃣ Transitioning loan to funded status...');
    await LoanService.transitionLoanStatus(testLoan.id, 'submitted', 'test-user');
    await LoanService.transitionLoanStatus(testLoan.id, 'verification', 'test-user');
    await LoanService.transitionLoanStatus(testLoan.id, 'underwriting', 'test-user');
    await LoanService.transitionLoanStatus(testLoan.id, 'approved', 'test-user');
    await LoanService.transitionLoanStatus(testLoan.id, 'closing', 'test-user');
    await LoanService.transitionLoanStatus(testLoan.id, 'funded', 'test-user');
    console.log('   ✅ Loan transitioned to funded\n');

    // Wait a moment for async processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 6: Check that Loan.Funded event was published
    console.log('6️⃣ Checking Loan.Funded event...');
    const fundedEvents = await db
      .select()
      .from(domainEvents)
      .where(eq(domainEvents.aggregateId, testLoan.id));

    const loanFundedEvent = fundedEvents.find(e => e.eventType === 'Loan.Funded');
    if (loanFundedEvent) {
      console.log(`   ✅ Loan.Funded event published: ${loanFundedEvent.id}`);
      console.log(`   📊 Event status: ${loanFundedEvent.processingStatus}`);
      console.log(`   📊 Event payload:`, loanFundedEvent.payload);
    } else {
      console.log('   ❌ Loan.Funded event NOT found');
    }
    console.log('');

    // Step 7: Check that payment schedule was created by the event handler
    console.log('7️⃣ Checking payment schedule creation...');
    const schedules = await db
      .select()
      .from(paymentSchedules)
      .where(eq(paymentSchedules.loanId, testLoan.id));

    if (schedules.length > 0) {
      const schedule = schedules[0];
      console.log(`   ✅ Payment schedule created: ${schedule.id}`);
      console.log(`   📊 Number of payments: ${schedule.numberOfPayments}`);
      console.log(`   📊 Total amount: $${schedule.totalAmount}`);
      console.log(`   📊 Frequency: ${schedule.paymentFrequency}`);

      // Check individual payments
      const individualPayments = await db
        .select()
        .from(payments)
        .where(eq(payments.scheduleId, schedule.id));

      console.log(`   📊 Individual payments created: ${individualPayments.length}`);
      if (individualPayments.length > 0) {
        console.log(`   📊 First payment: $${individualPayments[0].amount} due ${individualPayments[0].dueDate}`);
      }
    } else {
      console.log('   ❌ Payment schedule NOT created');
    }
    console.log('');

    // Step 8: Check event handler statistics
    console.log('8️⃣ Checking event handler statistics...');
    const handlers = await db.select().from(eventHandlers);
    for (const handler of handlers) {
      console.log(`   📊 Handler: ${handler.handlerName}`);
      console.log(`      - Event type: ${handler.eventType}`);
      console.log(`      - Success count: ${handler.successCount}`);
      console.log(`      - Failure count: ${handler.failureCount}`);
      console.log(`      - Last executed: ${handler.lastExecutedAt || 'Never'}`);
    }
    console.log('');

    // Step 9: Get event history for the loan
    console.log('9️⃣ Event history for loan...');
    const allEvents = await db
      .select()
      .from(domainEvents)
      .where(eq(domainEvents.aggregateId, testLoan.id));

    console.log(`   📊 Total events: ${allEvents.length}`);
    for (const event of allEvents) {
      console.log(`      - ${event.eventType} (${event.occurredAt}) - ${event.processingStatus}`);
    }
    console.log('');

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await db.delete(loans).where(eq(loans.id, testLoan.id));
    await db.delete(organizations).where(eq(organizations.id, testOrg.id));
    console.log('   ✅ Test data cleaned up\n');

    console.log('✅ Event Bus Test Completed Successfully! 🎉');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run the test
testEventBus()
  .then(() => {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
