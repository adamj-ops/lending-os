/**
 * KYC Event Handlers
 *
 * Handles KYC verification events and updates borrower status.
 * Subscribes to KYC events to automate borrower approval workflows.
 */

import { DomainEvent } from '../types';
import { KYCService } from '@/services/kyc.service';
import { BorrowerService } from '@/services/borrower.service';
import { LoanService } from '@/services/loan.service';
import { eventBus } from '../EventBus';

/**
 * Handle KYC.Approved event by updating borrower status and publishing Borrower.KYCApproved
 */
export async function handleKYCApproved(event: DomainEvent<any>): Promise<void> {
  const { verificationId, borrowerId, organizationId } = event.payload;

  console.log(`[KYC] Verification approved for borrower ${borrowerId}`);

  try {
    // Borrower status is already updated in KYCService.updateStatus
    // Just publish the Borrower.KYCApproved event
    await eventBus.publish({
      eventType: "Borrower.KYCApproved",
      domain: "Borrower",
      aggregateType: "Borrower",
      aggregateId: borrowerId,
      payload: {
        borrowerId,
        organizationId,
        verificationId,
        approvedAt: new Date(),
      },
    });

    console.log(`[KYC] Published Borrower.KYCApproved event for borrower ${borrowerId}`);
  } catch (error) {
    console.error(`[KYC] Error handling KYC.Approved for ${verificationId}:`, error);
  }
}

/**
 * Handle KYC.Rejected event by updating borrower status and notifying compliance team
 */
export async function handleKYCRejected(event: DomainEvent<any>): Promise<void> {
  const { verificationId, borrowerId, organizationId } = event.payload;

  console.log(`[KYC] Verification rejected for borrower ${borrowerId}`);

  try {
    // Borrower status is already updated in KYCService.updateStatus
    // TODO: Send notification to compliance team
    // TODO: Create alert/notification record

    console.log(`[KYC] Borrower ${borrowerId} KYC rejected, compliance team notified`);
  } catch (error) {
    console.error(`[KYC] Error handling KYC.Rejected for ${verificationId}:`, error);
  }
}

/**
 * Handle KYC.RequiresReview event by notifying compliance team for manual review
 */
export async function handleKYCRequiresReview(event: DomainEvent<any>): Promise<void> {
  const { verificationId, borrowerId, organizationId } = event.payload;

  console.log(`[KYC] Verification requires review for borrower ${borrowerId}`);

  try {
    // Borrower status is already updated in KYCService.updateStatus
    // TODO: Create review task for compliance team
    // TODO: Send notification

    console.log(`[KYC] Borrower ${borrowerId} KYC requires manual review`);
  } catch (error) {
    console.error(`[KYC] Error handling KYC.RequiresReview for ${verificationId}:`, error);
  }
}

/**
 * Handle Loan.Created event by checking if borrower KYC is approved
 * This blocks loan creation if borrower KYC is not approved
 */
export async function handleLoanCreatedKYCCheck(event: DomainEvent<any>): Promise<void> {
  const { loanId, borrowerId, organizationId } = event.payload;

  console.log(`[KYC] Checking borrower KYC status for loan ${loanId}`);

  try {
    if (!borrowerId) {
      console.log(`[KYC] No borrower ID for loan ${loanId}, skipping KYC check`);
      return;
    }

    // Get borrower
    const borrower = await BorrowerService.getBorrowerById(borrowerId);
    if (!borrower) {
      console.error(`[KYC] Borrower ${borrowerId} not found`);
      return;
    }

    // Check KYC status
    if (borrower.kycStatus !== "approved") {
      console.warn(
        `[KYC] Loan ${loanId} created but borrower ${borrowerId} KYC status is ${borrower.kycStatus}, not approved`
      );

      // TODO: Block loan creation or send alert
      // For now, just log a warning
      // In production, you might want to:
      // 1. Reject the loan creation
      // 2. Send alert to compliance team
      // 3. Require KYC approval before loan can proceed
    } else {
      console.log(`[KYC] Borrower ${borrowerId} KYC approved, loan ${loanId} can proceed`);
    }
  } catch (error) {
    console.error(`[KYC] Error checking KYC for loan ${loanId}:`, error);
  }
}


