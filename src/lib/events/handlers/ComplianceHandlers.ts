/**
 * Compliance Event Handlers
 *
 * Handles compliance-related events for document generation and automation.
 * Subscribes to Loan.Created and Investor.Onboarded events to auto-generate documents.
 */

import { DomainEvent } from '../types';
import { SignatureService } from '@/services/signature.service';
import { LoanService } from '@/services/loan.service';
import { FundService } from '@/services/fund.service';
import { BorrowerService } from '@/services/borrower.service';
import { ComplianceService } from '@/services/compliance.service';
import { EventTypes } from '../types';

/**
 * Handle Loan.Created event by auto-generating loan agreement for signing
 */
export async function handleLoanCreated(event: DomainEvent<any>): Promise<void> {
  const { loanId, organizationId, borrowerId, lenderId } = event.payload;

  console.log(`[Compliance] Auto-generating loan agreement for loan ${loanId}`);

  try {
    // Get loan details
    const loan = await LoanService.getLoanById(loanId);
    if (!loan) {
      console.error(`[Compliance] Loan ${loanId} not found`);
      return;
    }

    // Get borrower and lender information
    const borrower = borrowerId ? await BorrowerService.getBorrowerById(borrowerId) : null;
    const lender = lenderId ? await LoanService.getLenderById(lenderId) : null;

    if (!borrower) {
      console.error(`[Compliance] Borrower ${borrowerId} not found`);
      return;
    }

    // Prepare signers
    const signers = [];
    
    // Add borrower as signer
    signers.push({
      email: borrower.email,
      name: borrower.firstName && borrower.lastName 
        ? `${borrower.firstName} ${borrower.lastName}` 
        : borrower.name || borrower.email,
      role: "borrower",
      order: 1,
    });

    // Add lender as signer if available
    if (lender) {
      signers.push({
        email: lender.email,
        name: lender.name || lender.email,
        role: "lender",
        order: 2,
      });
    }

    // Create signature envelope for loan agreement
    await SignatureService.createEnvelope({
      organizationId,
      documentType: "loan_agreement",
      documentId: loanId,
      loanId,
      signers,
    });

    console.log(`[Compliance] Created loan agreement signature envelope for loan ${loanId}`);
  } catch (error) {
    console.error(`[Compliance] Error handling Loan.Created for ${loanId}:`, error);
  }
}

/**
 * Handle Investor.Created event by auto-generating PPM and subscription docs
 */
export async function handleInvestorCreated(event: DomainEvent<any>): Promise<void> {
  const { investorId, fundId, organizationId } = event.payload;

  console.log(`[Compliance] Auto-generating PPM and subscription docs for investor ${investorId}`);

  try {
    // Get fund details
    const fund = fundId ? await FundService.getFundById(fundId) : null;
    if (!fund) {
      console.error(`[Compliance] Fund ${fundId} not found`);
      return;
    }

    // Get investor details (assuming investor is a lender)
    // TODO: Get actual investor information from fund domain
    const investor = null; // await FundService.getInvestorById(investorId);

    if (!investor) {
      console.error(`[Compliance] Investor ${investorId} not found`);
      return;
    }

    // Prepare signers
    const signers = [{
      email: (investor as any).email || "",
      name: (investor as any).name || "",
      role: "investor",
      order: 1,
    }];

    // Create PPM signature envelope
    await SignatureService.createEnvelope({
      organizationId,
      documentType: "ppm",
      documentId: fundId,
      fundId,
      signers,
    });

    // Create subscription agreement signature envelope
    await SignatureService.createEnvelope({
      organizationId,
      documentType: "subscription_agreement",
      documentId: fundId,
      fundId,
      signers,
    });

    console.log(`[Compliance] Created PPM and subscription docs for investor ${investorId}`);
  } catch (error) {
    console.error(`[Compliance] Error handling Investor.Created for ${investorId}:`, error);
  }
}

/**
 * Handle Document.Completed event by updating loan/fund status
 */
export async function handleDocumentCompleted(event: DomainEvent<any>): Promise<void> {
  const { signatureId, documentType, loanId, fundId } = event.payload;

  console.log(`[Compliance] Document completed: ${signatureId}, type: ${documentType}`);

  try {
    // Update loan status if loan agreement completed
    if (documentType === "loan_agreement" && loanId) {
      // TODO: Update loan status to "approved" or trigger next workflow step
      console.log(`[Compliance] Loan agreement completed for loan ${loanId}`);
    }

    // Update fund status if PPM/subscription completed
    if ((documentType === "ppm" || documentType === "subscription_agreement") && fundId) {
      // TODO: Update fund commitment status or trigger next workflow step
      console.log(`[Compliance] Fund document completed for fund ${fundId}`);
    }
  } catch (error) {
    console.error(`[Compliance] Error handling Document.Completed for ${signatureId}:`, error);
  }
}

/**
 * Handle Loan.Funded event by creating audit log entry
 */
export async function handleLoanFundedAudit(event: DomainEvent<any>): Promise<void> {
  const { loanId, organizationId, principal, fundedBy } = event.payload;

  console.log(`[Compliance] Creating audit log for loan ${loanId} funded`);

  try {
    await ComplianceService.createAuditLog({
      organizationId,
      eventType: EventTypes.LOAN_FUNDED,
      entityType: "loan",
      entityId: loanId,
      userId: fundedBy,
      action: "funded",
      changes: {
        principal,
        fundedAt: new Date(),
      },
    });

    console.log(`[Compliance] Audit log created for loan ${loanId} funded`);
  } catch (error) {
    console.error(`[Compliance] Error creating audit log for loan ${loanId}:`, error);
  }
}

/**
 * Handle Payment.Processed event by creating audit log entry
 */
export async function handlePaymentReceivedAudit(event: DomainEvent<any>): Promise<void> {
  const { paymentId, loanId, organizationId, amount, processedBy } = event.payload;

  console.log(`[Compliance] Creating audit log for payment ${paymentId}`);

  try {
    await ComplianceService.createAuditLog({
      organizationId,
      eventType: EventTypes.PAYMENT_PROCESSED,
      entityType: "payment",
      entityId: paymentId,
      userId: processedBy,
      action: "processed",
      changes: {
        loanId,
        amount,
        processedAt: new Date(),
      },
    });

    console.log(`[Compliance] Audit log created for payment ${paymentId}`);
  } catch (error) {
    console.error(`[Compliance] Error creating audit log for payment ${paymentId}:`, error);
  }
}

/**
 * Scheduled job: Check for upcoming filings and publish Filing.Due events
 * This should be run daily via cron job or scheduled task
 */
export async function checkUpcomingFilings(): Promise<void> {
  console.log(`[Compliance] Checking for upcoming filings`);

  try {
    // Get all organizations (in production, would iterate through active orgs)
    // For now, this is a placeholder - actual implementation would:
    // 1. Get all active organizations
    // 2. For each org, check upcoming filings
    // 3. Publish Filing.Due events for filings due in 30, 7, or 1 days

    // This would be called by a cron job or scheduled task
    console.log(`[Compliance] Filing check completed (placeholder)`);
  } catch (error) {
    console.error(`[Compliance] Error checking upcoming filings:`, error);
  }
}

/**
 * Scheduled job: Check for expiring licenses and publish License.Expiring events
 * This should be run daily via cron job or scheduled task
 */
export async function checkExpiringLicenses(): Promise<void> {
  console.log(`[Compliance] Checking for expiring licenses`);

  try {
    // Get all organizations (in production, would iterate through active orgs)
    // For now, this is a placeholder - actual implementation would:
    // 1. Get all active organizations
    // 2. For each org, check expiring licenses
    // 3. Publish License.Expiring events for licenses expiring in 90 or 30 days

    // This would be called by a cron job or scheduled task
    console.log(`[Compliance] License check completed (placeholder)`);
  } catch (error) {
    console.error(`[Compliance] Error checking expiring licenses:`, error);
  }
}

