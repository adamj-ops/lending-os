/**
 * API v2 - Individual Loan Endpoints
 *
 * GET    /api/v2/loans/:id - Get loan by ID
 * PATCH  /api/v2/loans/:id - Update loan
 * DELETE /api/v2/loans/:id - Delete loan
 */

import { NextRequest } from 'next/server';
import { LoanService } from '@/services/loan.service';
import { updateLoanSchema } from '@/app/(main)/(ops)/loans/schema';
import { eventBus, EventTypes } from '@/lib/events';
import type { LoanStatusChangedPayload } from '@/lib/events';
import {
  withAPIMiddleware,
  successResponse,
  validateRequestBody,
  requireAuth,
} from '../../middleware';

/**
 * GET /api/v2/loans/:id
 *
 * Get a specific loan with all relations.
 */
export const GET = withAPIMiddleware(async (
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) => {
  // Require authentication
  await requireAuth(request);

  // Get loan ID from params
  const { id } = await params;

  // Get loan with relations
  const loan = await LoanService.getLoanWithRelations(id);

  if (!loan) {
    throw new Error(`Loan ${id} not found`);
  }

  return successResponse(loan);
});

/**
 * PATCH /api/v2/loans/:id
 *
 * Update a loan.
 */
export const PATCH = withAPIMiddleware(async (
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) => {
  // Require authentication
  const { userId, organizationId } = await requireAuth(request);

  // Get loan ID from params
  const { id } = await params;

  // Validate request body
  const body = await validateRequestBody(request, updateLoanSchema);

  // Filter out null values (convert to undefined for DTO compatibility)
  const updateData = Object.fromEntries(
    Object.entries(body).map(([key, value]) => [key, value === null ? undefined : value])
  );

  // Update loan via service
  const loan = await LoanService.updateLoan(id, updateData as any);

  if (!loan) {
    throw new Error(`Loan ${id} not found`);
  }

  // If status was changed, publish event
  if ('status' in updateData && updateData.status) {
    await eventBus.publish<LoanStatusChangedPayload>({
      eventType: EventTypes.LOAN_STATUS_CHANGED,
      eventVersion: '1.0',
      aggregateId: loan.id,
      aggregateType: 'Loan',
      payload: {
        loanId: loan.id,
        organizationId: loan.organizationId,
        previousStatus: loan.status,
        newStatus: updateData.status as string,
        changedBy: userId,
      },
      metadata: {
        userId,
        organizationId,
        source: 'API.v2.loans.PATCH',
      },
    });
  }

  return successResponse(loan, {
    message: 'Loan updated successfully',
  });
});

/**
 * DELETE /api/v2/loans/:id
 *
 * Delete a loan.
 */
export const DELETE = withAPIMiddleware(async (
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) => {
  // Require authentication
  await requireAuth(request);

  // Get loan ID from params
  const { id } = await params;

  // Delete loan
  await LoanService.deleteLoan(id);

  return successResponse(
    { deleted: true },
    { message: 'Loan deleted successfully' }
  );
});
