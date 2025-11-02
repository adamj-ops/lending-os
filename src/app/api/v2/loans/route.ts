/**
 * API v2 - Loans Endpoints
 *
 * GET  /api/v2/loans - List loans
 * POST /api/v2/loans - Create loan
 */

import { NextRequest } from 'next/server';
import { LoanService } from '@/services/loan.service';
import { createLoanSchema, loanFilterSchema } from '@/app/(main)/(ops)/loans/schema';
import { eventBus, EventTypes } from '@/lib/events';
import type { LoanCreatedPayload } from '@/lib/events';
import {
  withAPIMiddleware,
  successResponse,
  validateRequestBody,
  validateQueryParams,
  requireAuth,
  getPaginationParams,
} from '../middleware';

/**
 * GET /api/v2/loans
 *
 * List loans with filtering and pagination.
 */
export const GET = withAPIMiddleware(async (request: NextRequest) => {
  // Require authentication
  const { organizationId } = await requireAuth(request);

  // Validate and parse query parameters
  const filters = validateQueryParams(request, loanFilterSchema);
  const { page, pageSize, offset } = getPaginationParams(request);

  // Apply organization filter
  const loansQuery = {
    ...filters,
    organizationId,
  };

  // Get loans from service
  const loans = await LoanService.getLoansByOrganization(organizationId);

  // TODO: Add actual filtering and pagination logic
  // For now, return all loans

  return successResponse(loans, {
    page,
    pageSize,
    total: loans.length,
  });
});

/**
 * POST /api/v2/loans
 *
 * Create a new loan.
 */
export const POST = withAPIMiddleware(async (request: NextRequest) => {
  // Require authentication
  const { userId, organizationId } = await requireAuth(request);

  // Validate request body
  const body = await validateRequestBody(request, createLoanSchema);

  // Create loan via service
  const loan = await LoanService.createLoan({
    ...body,
    organizationId,
    createdBy: userId,
    loanCategory: body.loanCategory || 'asset_backed',
  } as any);

  // Publish Loan.Created event
  await eventBus.publish<LoanCreatedPayload>({
    eventType: EventTypes.LOAN_CREATED,
    eventVersion: '1.0',
    aggregateId: loan.id,
    aggregateType: 'Loan',
    payload: {
      loanId: loan.id,
      organizationId: loan.organizationId,
      borrowerId: loan.borrowerId ?? undefined,
      lenderId: loan.lenderId ?? undefined,
      principal: loan.principal,
      rate: loan.rate,
      termMonths: loan.termMonths,
      loanCategory: loan.loanCategory,
      createdBy: userId,
    },
    metadata: {
      userId,
      organizationId,
      source: 'API.v2.loans.POST',
    },
  });

  return successResponse(loan, {
    message: 'Loan created successfully',
  });
});
