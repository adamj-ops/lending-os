/**
 * Fund-Loan Integration Event Handlers
 *
 * Cross-domain handlers that connect Loan domain events with Fund domain operations.
 * These handlers enable automatic capital tracking when loans are funded or payments are processed.
 */

import { DomainEvent } from '../types';
import type { LoanFundedPayload, PaymentProcessedPayload, LoanStatusChangedPayload } from '../types';
import { db } from '@/db/client';
import { fundLoanAllocations, loans } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Handle Loan.Funded event
 *
 * When a loan is funded, check if it has fund allocations and publish Capital.Allocated events.
 * This is typically already handled in FundService.allocateToLoan, so this handler
 * is mainly for validation and logging.
 */
export async function handleLoanFundedForFunds(
  event: DomainEvent<LoanFundedPayload>
): Promise<void> {
  const { loanId } = event.payload;

  console.log(`[FundLoanIntegration] Loan ${loanId} funded, checking for fund allocations...`);

  // Check if this loan has any fund allocations
  const allocations = await db
    .select()
    .from(fundLoanAllocations)
    .where(eq(fundLoanAllocations.loanId, loanId));

  if (allocations.length > 0) {
    console.log(
      `[FundLoanIntegration] Loan ${loanId} has ${allocations.length} fund allocation(s)`
    );

    for (const allocation of allocations) {
      console.log(
        `[FundLoanIntegration] - Fund ${allocation.fundId}: $${allocation.allocatedAmount}`
      );
    }
  } else {
    console.log(`[FundLoanIntegration] Loan ${loanId} has no fund allocations (direct lending)`);
  }
}

/**
 * Handle Payment.Processed event
 *
 * When a payment is processed, calculate if any portion should be returned to funds.
 * This is a simplified version - in a real system, you'd need more complex logic
 * to determine principal vs interest allocation.
 */
export async function handlePaymentProcessedForFunds(
  event: DomainEvent<PaymentProcessedPayload>
): Promise<void> {
  const { loanId, amount, paymentId } = event.payload;

  console.log(
    `[FundLoanIntegration] Payment processed for loan ${loanId}: $${amount}, checking fund allocations...`
  );

  // Get fund allocations for this loan
  const allocations = await db
    .select()
    .from(fundLoanAllocations)
    .where(eq(fundLoanAllocations.loanId, loanId));

  if (allocations.length === 0) {
    // No fund allocations, this is a direct loan
    return;
  }

  // Check if there are any outstanding allocations
  const outstandingAllocations = allocations.filter((allocation) => {
    const allocated = parseFloat(allocation.allocatedAmount);
    const returned = parseFloat(allocation.returnedAmount);
    return returned < allocated;
  });

  if (outstandingAllocations.length === 0) {
    console.log(`[FundLoanIntegration] All fund allocations for loan ${loanId} are fully returned`);
    return;
  }

  console.log(
    `[FundLoanIntegration] Loan ${loanId} has ${outstandingAllocations.length} outstanding fund allocation(s)`
  );

  // In a real system, you would:
  // 1. Determine what portion of the payment is principal return
  // 2. Calculate pro-rata share for each fund allocation
  // 3. Call FundService.returnFromLoan() for each fund's share
  // 4. Handle interest payments separately (usually go to fund as profit)

  // For now, just log what would happen
  const totalOutstanding = outstandingAllocations.reduce((sum, allocation) => {
    return sum + (parseFloat(allocation.allocatedAmount) - parseFloat(allocation.returnedAmount));
  }, 0);

  console.log(
    `[FundLoanIntegration] Total outstanding fund capital on loan ${loanId}: $${totalOutstanding.toFixed(2)}`
  );

  for (const allocation of outstandingAllocations) {
    const outstanding =
      parseFloat(allocation.allocatedAmount) - parseFloat(allocation.returnedAmount);
    const fundShare = (outstanding / totalOutstanding) * parseFloat(amount);

    console.log(
      `[FundLoanIntegration] - Fund ${allocation.fundId} would receive $${fundShare.toFixed(2)} return (${((outstanding / totalOutstanding) * 100).toFixed(1)}% pro-rata)`
    );

    // TODO: Implement automatic return logic
    // await FundService.returnFromLoan(allocation.id, fundShare, new Date());
  }
}

/**
 * Handle Loan.StatusChanged event
 *
 * When a loan status changes (especially to delinquent), update fund risk metrics
 * and create alerts for fund managers.
 */
export async function handleLoanStatusChangedForFunds(
  event: DomainEvent<LoanStatusChangedPayload>
): Promise<void> {
  const { loanId, previousStatus, newStatus } = event.payload;

  // Only handle status changes that indicate risk
  const riskStatuses = ['delinquent', 'default', 'foreclosure'];

  if (!riskStatuses.includes(newStatus.toLowerCase())) {
    return;
  }

  console.log(
    `[FundLoanIntegration] Loan ${loanId} status changed to ${newStatus} (from ${previousStatus}) - checking fund allocations...`
  );

  // Get fund allocations for this loan
  const allocations = await db
    .select()
    .from(fundLoanAllocations)
    .where(eq(fundLoanAllocations.loanId, loanId));

  if (allocations.length === 0) {
    return;
  }

  console.log(
    `[FundLoanIntegration] ⚠️  RISK ALERT: Loan ${loanId} (status: ${newStatus}) has ${allocations.length} fund allocation(s)`
  );

  for (const allocation of allocations) {
    const outstanding =
      parseFloat(allocation.allocatedAmount) - parseFloat(allocation.returnedAmount);

    console.log(
      `[FundLoanIntegration] ⚠️  Fund ${allocation.fundId} has $${outstanding.toFixed(2)} at risk in loan ${loanId}`
    );

    // TODO: Create alert using AlertService
    // await AlertService.createAlert({
    //   entityType: 'fund',
    //   entityId: allocation.fundId,
    //   code: 'fund_allocation_risk',
    //   message: `Loan ${loanId} backed by this fund is now ${newStatus}. Outstanding: $${outstanding.toFixed(2)}`,
    //   severity: 'warning',
    // });
  }

  // In a real system, you might also:
  // 1. Update fund performance metrics
  // 2. Trigger portfolio rebalancing
  // 3. Notify fund investors
  // 4. Update fund dashboard risk indicators
}

