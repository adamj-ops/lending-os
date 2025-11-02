/**
 * API v2 - Loan Payments Endpoints
 *
 * GET  /api/v2/loans/:id/payments - List payments for a loan
 * POST /api/v2/loans/:id/payments - Record a payment for a loan
 */

import { NextRequest } from 'next/server';
import { recordPaymentSchema, paymentFilterSchema } from '@/app/(main)/(ops)/loans/payments/schema';
import { eventBus, EventTypes } from '@/lib/events';
import type { PaymentProcessedPayload } from '@/lib/events';
import {
  withAPIMiddleware,
  successResponse,
  validateRequestBody,
  validateQueryParams,
  requireAuth,
  getPaginationParams,
} from '../../../middleware';

/**
 * GET /api/v2/loans/:id/payments
 *
 * List all payments for a specific loan.
 */
export const GET = withAPIMiddleware(async (
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) => {
  // Require authentication
  await requireAuth(request);

  // Get loan ID from params
  const { id: loanId } = await params;

  // Validate query parameters
  const filters = validateQueryParams(request, paymentFilterSchema);
  const { page, pageSize } = getPaginationParams(request);

  // TODO: Implement payment service
  // For now, return placeholder
  const payments: unknown[] = [];

  return successResponse(payments, {
    page,
    pageSize,
    total: 0,
    loanId,
  });
});

/**
 * POST /api/v2/loans/:id/payments
 *
 * Record a new payment for a loan.
 */
export const POST = withAPIMiddleware(async (
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) => {
  // Require authentication
  const { userId, organizationId } = await requireAuth(request);

  // Get loan ID from params
  const { id: loanId } = await params;

  // Validate request body
  const body = await validateRequestBody(request, recordPaymentSchema);

  // Ensure loanId matches
  if (body.loanId !== loanId) {
    throw new Error('Loan ID in body must match URL parameter');
  }

  // TODO: Implement payment service
  // For now, create mock payment
  const payment = {
    id: crypto.randomUUID(),
    ...body,
    createdBy: userId,
    createdAt: new Date(),
  };

  // Publish Payment.Processed event
  await eventBus.publish<PaymentProcessedPayload>({
    eventType: EventTypes.PAYMENT_PROCESSED,
    eventVersion: '1.0',
    aggregateId: payment.id,
    aggregateType: 'Payment',
    payload: {
      paymentId: payment.id,
      loanId,
      organizationId,
      amount: body.amount.toString(),
      processedDate: body.paymentDate,
      paymentMethod: body.paymentMethod,
      transactionId: body.transactionReference ?? undefined,
      processedBy: userId,
    },
    metadata: {
      userId,
      organizationId,
      source: 'API.v2.loans.payments.POST',
    },
  });

  return successResponse(payment, {
    message: 'Payment recorded successfully',
  });
});
