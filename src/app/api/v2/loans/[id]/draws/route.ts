/**
 * API v2 - Loan Draws Endpoints
 *
 * GET  /api/v2/loans/:id/draws - List draws for a loan
 * POST /api/v2/loans/:id/draws - Request a draw for a loan
 */

import { NextRequest } from 'next/server';
import { requestDrawSchema, drawFilterSchema } from '@/app/(main)/(ops)/loans/draws/schema';
import { eventBus, EventTypes } from '@/lib/events';
import type { DrawRequestedPayload } from '@/lib/events';
import {
  withAPIMiddleware,
  successResponse,
  validateRequestBody,
  validateQueryParams,
  requireAuth,
  getPaginationParams,
} from '../../../middleware';

/**
 * GET /api/v2/loans/:id/draws
 *
 * List all draws for a specific loan.
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
  const filters = validateQueryParams(request, drawFilterSchema);
  const { page, pageSize } = getPaginationParams(request);

  // TODO: Implement draw service
  // For now, return placeholder
  const draws: unknown[] = [];

  return successResponse(draws, {
    page,
    pageSize,
    total: 0,
    loanId,
  });
});

/**
 * POST /api/v2/loans/:id/draws
 *
 * Request a new draw for a loan.
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
  const body = await validateRequestBody(request, requestDrawSchema);

  // Ensure loanId matches
  if (body.loanId !== loanId) {
    throw new Error('Loan ID in body must match URL parameter');
  }

  // TODO: Implement draw service
  // For now, create mock draw
  const draw = {
    id: crypto.randomUUID(),
    ...body,
    status: 'submitted' as const,
    requestedBy: userId,
    createdAt: new Date(),
  };

  // Publish Draw.Requested event
  await eventBus.publish<DrawRequestedPayload>({
    eventType: EventTypes.DRAW_REQUESTED,
    eventVersion: '1.0',
    aggregateId: draw.id,
    aggregateType: 'Draw',
    payload: {
      drawId: draw.id,
      loanId,
      organizationId,
      amount: body.amount.toString(),
      requestedDate: body.requestedDate || new Date(),
      requestedBy: userId,
      notes: body.notes ?? undefined,
    },
    metadata: {
      userId,
      organizationId,
      source: 'API.v2.loans.draws.POST',
    },
  });

  return successResponse(draw, {
    message: 'Draw requested successfully',
  });
});
