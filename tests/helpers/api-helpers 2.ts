/**
 * API Test Helpers
 *
 * Utilities for testing Next.js API routes
 */

import { NextRequest } from 'next/server';

/**
 * Create a NextRequest for testing
 */
export function createMockRequest(
  url: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
    params?: Record<string, string>;
  }
): NextRequest {
  const { method = 'GET', body, headers = {} } = options || {};

  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    requestInit.body = JSON.stringify(body);
  }

  return new NextRequest(new URL(url), requestInit as any);
}

/**
 * Create a mock NextRequest with query parameters
 */
export function createRequestWithParams(
  baseUrl: string,
  params: Record<string, string | string[]>
): NextRequest {
  const url = new URL(baseUrl);

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      url.searchParams.set(key, value.join(','));
    } else {
      url.searchParams.set(key, value);
    }
  });

  return new NextRequest(url);
}

/**
 * Parse response JSON safely
 */
export async function parseResponse<T = any>(response: Response): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw new Error(`Failed to parse response: ${text}`);
  }
}

/**
 * Assert response status and parse JSON
 */
export async function expectSuccessResponse<T = any>(
  response: Response,
  expectedStatus: number = 200
): Promise<T> {
  const data = await parseResponse<T>(response);

  if (response.status !== expectedStatus) {
    throw new Error(
      `Expected status ${expectedStatus} but got ${response.status}. Response: ${JSON.stringify(data)}`
    );
  }

  return data;
}

/**
 * Assert error response
 */
export async function expectErrorResponse(
  response: Response,
  expectedStatus: number,
  expectedMessage?: string
): Promise<{ error?: string; message?: string; code?: number }> {
  const data = await parseResponse<{ error?: string; message?: string; code?: number }>(response);

  if (response.status !== expectedStatus) {
    throw new Error(
      `Expected status ${expectedStatus} but got ${response.status}. Response: ${JSON.stringify(data)}`
    );
  }

  if (expectedMessage && data.error !== expectedMessage && data.message !== expectedMessage) {
    throw new Error(
      `Expected error message "${expectedMessage}" but got: ${data.error || data.message}`
    );
  }

  return data;
}

/**
 * Mock route params (for dynamic routes like [id])
 */
export function createMockParams<T extends Record<string, string>>(params: T): Promise<T> {
  return Promise.resolve(params);
}

/**
 * Common test URLs
 */
export const TEST_URLS = {
  base: 'http://localhost:3000',
  api: 'http://localhost:3000/api/v1',
  analytics: 'http://localhost:3000/api/v1/analytics',
  loans: 'http://localhost:3000/api/v1/loans',
  funds: 'http://localhost:3000/api/v1/funds',
  payments: 'http://localhost:3000/api/v1/payments',
  inspections: 'http://localhost:3000/api/v1/inspections',
};

/**
 * Build API URL with path and query params
 */
export function buildApiUrl(
  path: string,
  queryParams?: Record<string, string | number | boolean | undefined>
): string {
  const url = new URL(path, TEST_URLS.base);

  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

/**
 * Assert cache headers
 */
export function assertCacheHeaders(
  response: Response,
  expectedCacheControl?: string,
  expectedCacheTags?: string
) {
  if (expectedCacheControl) {
    const cacheControl = response.headers.get('Cache-Control');
    if (cacheControl !== expectedCacheControl) {
      throw new Error(
        `Expected Cache-Control "${expectedCacheControl}" but got "${cacheControl}"`
      );
    }
  }

  if (expectedCacheTags) {
    const cacheTags = response.headers.get('X-Cache-Tags');
    if (cacheTags !== expectedCacheTags) {
      throw new Error(
        `Expected X-Cache-Tags "${expectedCacheTags}" but got "${cacheTags}"`
      );
    }
  }
}

/**
 * Common analytics query params builder
 */
export function buildAnalyticsQueryParams(options: {
  start?: string;
  end?: string;
  loanIds?: string[];
  propertyIds?: string[];
  statuses?: string[];
  fundIds?: string[];
}): Record<string, string> {
  const params: Record<string, string> = {};

  if (options.start) params.start = options.start;
  if (options.end) params.end = options.end;
  if (options.loanIds?.length) params.loanIds = options.loanIds.join(',');
  if (options.propertyIds?.length) params.propertyIds = options.propertyIds.join(',');
  if (options.statuses?.length) params.statuses = options.statuses.join(',');
  if (options.fundIds?.length) params.fundIds = options.fundIds.join(',');

  return params;
}
