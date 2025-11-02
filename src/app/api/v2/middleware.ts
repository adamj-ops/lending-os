/**
 * API v2 Middleware
 *
 * Common middleware for all v2 API endpoints.
 * Handles authentication, validation, error handling, and response formatting.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';

/**
 * API Error Response
 */
export interface APIError {
  error: {
    code: string;
    message: string;
    details?: unknown;
    timestamp: string;
    path: string;
  };
}

/**
 * API Success Response
 */
export interface APIResponse<T = unknown> {
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    [key: string]: unknown;
  };
}

/**
 * Error Handler
 *
 * Converts various error types to standardized API responses.
 */
export function handleAPIError(error: unknown, request: NextRequest): NextResponse<APIError> {
  console.error('API Error:', error);

  // Zod Validation Error
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: error.errors,
          timestamp: new Date().toISOString(),
          path: request.nextUrl.pathname,
        },
      },
      { status: 400 }
    );
  }

  // Custom Application Errors
  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes('not found')) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: error.message,
            timestamp: new Date().toISOString(),
            path: request.nextUrl.pathname,
          },
        },
        { status: 404 }
      );
    }

    if (error.message.includes('unauthorized') || error.message.includes('permission')) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: error.message,
            timestamp: new Date().toISOString(),
            path: request.nextUrl.pathname,
          },
        },
        { status: 403 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message,
          timestamp: new Date().toISOString(),
          path: request.nextUrl.pathname,
        },
      },
      { status: 500 }
    );
  }

  // Unknown error
  return NextResponse.json(
    {
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred',
        timestamp: new Date().toISOString(),
        path: request.nextUrl.pathname,
      },
    },
    { status: 500 }
  );
}

/**
 * Success Response Builder
 */
export function successResponse<T>(
  data: T,
  meta?: APIResponse<T>['meta']
): NextResponse<APIResponse<T>> {
  return NextResponse.json({
    data,
    ...(meta && { meta }),
  });
}

/**
 * Validate Request Body
 *
 * Validates request body against a Zod schema.
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  const body = await request.json();
  return schema.parse(body);
}

/**
 * Validate Query Parameters
 *
 * Validates URL query parameters against a Zod schema.
 */
export function validateQueryParams<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): T {
  const searchParams = request.nextUrl.searchParams;
  const params: Record<string, unknown> = {};

  searchParams.forEach((value, key) => {
    // Try to parse as number or boolean
    if (value === 'true') params[key] = true;
    else if (value === 'false') params[key] = false;
    else if (!isNaN(Number(value))) params[key] = Number(value);
    else params[key] = value;
  });

  return schema.parse(params);
}

/**
 * Require Authentication
 *
 * Ensures user is authenticated. Returns user info or throws.
 */
export async function requireAuth(request: NextRequest): Promise<{ userId: string; organizationId: string }> {
  // TODO: Implement actual auth check
  // For now, return mock data
  const userId = request.headers.get('x-user-id');
  const organizationId = request.headers.get('x-organization-id');

  if (!userId || !organizationId) {
    throw new Error('Authentication required');
  }

  return { userId, organizationId };
}

/**
 * Pagination Helper
 *
 * Extracts pagination parameters from request.
 */
export function getPaginationParams(request: NextRequest): {
  page: number;
  pageSize: number;
  offset: number;
} {
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
  const offset = (page - 1) * pageSize;

  return { page, pageSize, offset };
}

/**
 * API Route Handler Wrapper
 *
 * Wraps route handlers with common middleware (error handling, auth, etc.).
 */
export function withAPIMiddleware<T>(
  handler: (request: NextRequest, context: { params: Promise<Record<string, string>> }) => Promise<NextResponse<APIResponse<T>>>
) {
  return async (request: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    try {
      // Add CORS headers
      const response = await handler(request, context);

      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      return response;
    } catch (error) {
      return handleAPIError(error, request);
    }
  };
}

/**
 * Rate Limiting (Basic Implementation)
 *
 * Simple in-memory rate limiter. Should be replaced with Redis in production.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(identifier: string, maxRequests = 100, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}
