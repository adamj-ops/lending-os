/**
 * Fund Domain Event Handlers
 *
 * Handlers for fund-related events: capital allocation, returns, commitments, calls, etc.
 */

import { DomainEvent } from '../types';
import type {
  CapitalAllocatedPayload,
  CapitalReturnedPayload,
  CommitmentAddedPayload,
  CapitalCalledPayload,
  DistributionMadePayload,
} from '../types';
import { db } from '@/db/client';
import { funds, fundCommitments, fundLoanAllocations } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Handle Fund.CapitalAllocated event
 *
 * When capital is allocated from a fund to a loan:
 * - Update fund's totalDeployed (already done in FundService)
 * - Could trigger analytics update
 * - Could create alerts if deployment rate exceeds thresholds
 */
export async function handleFundCapitalAllocated(
  event: DomainEvent<CapitalAllocatedPayload>
): Promise<void> {
  const { fundId, loanId, amount } = event.payload;

  console.log(
    `[FundHandler] Capital allocated: $${amount} from fund ${fundId} to loan ${loanId}`
  );

  // Additional logic here if needed
  // For example, check if fund is over-allocated
  const [fund] = await db.select().from(funds).where(eq(funds.id, fundId)).limit(1);

  if (fund) {
    const deploymentRate =
      (parseFloat(fund.totalDeployed) / parseFloat(fund.totalCommitted)) * 100;

    if (deploymentRate > 95) {
      console.warn(
        `[FundHandler] Fund ${fundId} is ${deploymentRate.toFixed(1)}% deployed (high utilization)`
      );
      // Could create alert here
    }
  }
}

/**
 * Handle Fund.CapitalReturned event
 *
 * When capital is returned from a loan to a fund:
 * - Update fund's totalReturned (already done in FundService)
 * - Update commitment returnedAmount proportionally
 * - Could trigger distribution events
 */
export async function handleFundCapitalReturned(
  event: DomainEvent<CapitalReturnedPayload>
): Promise<void> {
  const { fundId, loanId, amount } = event.payload;

  console.log(
    `[FundHandler] Capital returned: $${amount} from loan ${loanId} to fund ${fundId}`
  );

  // Get allocation to check if fully returned
  const [allocation] = await db
    .select()
    .from(fundLoanAllocations)
    .where(eq(fundLoanAllocations.id, event.aggregateId))
    .limit(1);

  if (allocation) {
    const allocatedAmount = parseFloat(allocation.allocatedAmount);
    const returnedAmount = parseFloat(allocation.returnedAmount);

    if (returnedAmount >= allocatedAmount) {
      console.log(
        `[FundHandler] Allocation ${allocation.id} is fully returned (${returnedAmount}/${allocatedAmount})`
      );
    }
  }

  // Additional logic: Update commitments proportionally
  // In a real system, you'd calculate each investor's share of the return
  // and update their commitment.returnedAmount accordingly
}

/**
 * Handle Fund.CommitmentAdded event
 *
 * When a new commitment is added to a fund:
 * - Update fund's totalCommitted (already done in FundService)
 * - Could send welcome email to investor
 * - Could create onboarding tasks
 */
export async function handleCommitmentAdded(
  event: DomainEvent<CommitmentAddedPayload>
): Promise<void> {
  const { commitmentId, fundId, lenderId, committedAmount } = event.payload;

  console.log(
    `[FundHandler] New commitment: $${committedAmount} from lender ${lenderId} to fund ${fundId}`
  );

  // Check if fund is at capacity
  const [fund] = await db.select().from(funds).where(eq(funds.id, fundId)).limit(1);

  if (fund) {
    const totalCommitted = parseFloat(fund.totalCommitted);
    const totalCapacity = parseFloat(fund.totalCapacity);
    const utilizationRate = (totalCommitted / totalCapacity) * 100;

    console.log(
      `[FundHandler] Fund ${fundId} is ${utilizationRate.toFixed(1)}% committed (${totalCommitted}/${totalCapacity})`
    );

    if (utilizationRate >= 100) {
      console.log(`[FundHandler] Fund ${fundId} is at full capacity - consider closing`);
      // Could auto-close fund or create alert
    }
  }
}

/**
 * Handle Fund.CapitalCalled event
 *
 * When capital is called from investors:
 * - Create alerts for each investor who needs to fund
 * - Update commitment calledAmount (done when capital is received)
 * - Could send email notifications
 */
export async function handleCapitalCalled(
  event: DomainEvent<CapitalCalledPayload>
): Promise<void> {
  const { callId, fundId, callNumber, callAmount, dueDate } = event.payload;

  console.log(
    `[FundHandler] Capital call issued: Call #${callNumber} for $${callAmount} from fund ${fundId}, due ${dueDate}`
  );

  // Get all active commitments for this fund
  const commitments = await db
    .select()
    .from(fundCommitments)
    .where(eq(fundCommitments.fundId, fundId));

  const activeCommitments = commitments.filter((c) => c.status === 'active');

  console.log(
    `[FundHandler] Capital call affects ${activeCommitments.length} active investors`
  );

  // In a real system, you would:
  // 1. Calculate each investor's pro-rata share of the call
  // 2. Create individual alerts for each investor
  // 3. Send email notifications with payment instructions
  // 4. Set up monitoring for overdue calls

  // Example: Create alert for each investor (simplified)
  for (const commitment of activeCommitments) {
    const totalCommitted = parseFloat(commitment.committedAmount);
    const totalFundCommitted = commitments.reduce(
      (sum, c) => sum + parseFloat(c.committedAmount),
      0
    );
    const investorShare = (totalCommitted / totalFundCommitted) * parseFloat(callAmount);

    console.log(
      `[FundHandler] Investor ${commitment.lenderId} owes $${investorShare.toFixed(2)} (${((totalCommitted / totalFundCommitted) * 100).toFixed(1)}% pro-rata)`
    );

    // TODO: Create alert using AlertService
    // await AlertService.createAlert({
    //   entityType: 'fund_call',
    //   entityId: callId,
    //   code: 'capital_call_issued',
    //   message: `Capital call #${callNumber}: Please fund $${investorShare.toFixed(2)} by ${dueDate}`,
    //   severity: 'info',
    // });
  }
}

/**
 * Handle Fund.DistributionMade event
 *
 * When a distribution is made to investors:
 * - Update commitment records
 * - Could trigger tax reporting
 * - Send distribution notifications
 */
export async function handleDistributionMade(
  event: DomainEvent<DistributionMadePayload>
): Promise<void> {
  const { distributionId, fundId, totalAmount, distributionType } = event.payload;

  console.log(
    `[FundHandler] Distribution made: $${totalAmount} from fund ${fundId} (type: ${distributionType})`
  );

  // Get all active commitments
  const commitments = await db
    .select()
    .from(fundCommitments)
    .where(eq(fundCommitments.fundId, fundId));

  const totalFundCommitted = commitments.reduce(
    (sum, c) => sum + parseFloat(c.committedAmount),
    0
  );

  // Calculate each investor's share
  for (const commitment of commitments) {
    const investorCommitment = parseFloat(commitment.committedAmount);
    const investorShare =
      (investorCommitment / totalFundCommitted) * parseFloat(totalAmount);

    console.log(
      `[FundHandler] Investor ${commitment.lenderId} receives $${investorShare.toFixed(2)} distribution`
    );

    // In a real system:
    // 1. Record distribution in investor ledger
    // 2. Generate tax documents if needed
    // 3. Send notification email
    // 4. Update commitment.returnedAmount if this is return of capital
  }
}

