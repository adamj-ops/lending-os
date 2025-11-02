import { Page } from '@playwright/test';

/**
 * Create a test event via the events stream API
 * 
 * @param page - Playwright page instance
 * @param eventType - The domain event type (e.g., 'Loan.Funded')
 * @param payload - Event payload object
 * @param organizationId - Organization ID (optional, will use current session if not provided)
 * @returns Created event data
 */
export async function createTestEvent(
  page: Page,
  eventType: string,
  payload: Record<string, unknown> = {},
  organizationId?: string
) {
  const response = await page.request.post('/api/v1/events/stream', {
    data: {
      eventId: crypto.randomUUID(),
      eventType,
      domain: eventType.split('.')[0].toLowerCase(), // Extract domain from event type
      aggregateId: payload.aggregateId || crypto.randomUUID(),
      payload: {
        ...payload,
        organizationId: organizationId || payload.organizationId,
      },
    },
  });

  if (!response.ok()) {
    const error = await response.text();
    throw new Error(`Failed to create test event: ${error}`);
  }

  return response.json();
}

/**
 * Wait for analytics API to be called (indicating a refresh/invalidation occurred)
 * 
 * @param page - Playwright page instance
 * @param endpoint - Analytics endpoint to wait for (e.g., '/api/v1/loans/analytics')
 * @param timeout - Maximum time to wait in milliseconds
 * @returns Response object when API is called
 */
export async function waitForAnalyticsRefresh(
  page: Page,
  endpoint: string,
  timeout: number = 10000
) {
  return page.waitForResponse(
    (response) => {
      return response.url().includes(endpoint) && response.status() === 200;
    },
    { timeout }
  );
}

/**
 * Verify that analytics data has been updated
 * 
 * @param page - Playwright page instance
 * @param expectedData - Partial data object to check for in the response
 * @param endpoint - Analytics endpoint to check
 * @returns True if data matches expectations
 */
export async function verifyAnalyticsDataUpdated(
  page: Page,
  expectedData: Record<string, unknown>,
  endpoint: string
): Promise<boolean> {
  const response = await page.request.get(endpoint);
  
  if (!response.ok()) {
    return false;
  }

  const data = await response.json();
  
  // Check if expected data is present in response
  for (const [key, value] of Object.entries(expectedData)) {
    if (data.kpis?.[key] !== value && data.series?.[0]?.[key] !== value) {
      return false;
    }
  }

  return true;
}

/**
 * Get current analytics data for an endpoint
 * 
 * @param page - Playwright page instance
 * @param endpoint - Analytics endpoint
 * @returns Analytics data object
 */
export async function getAnalyticsData(page: Page, endpoint: string) {
  const response = await page.request.get(endpoint);
  
  if (!response.ok()) {
    throw new Error(`Failed to fetch analytics: ${response.statusText()}`);
  }

  return response.json();
}

/**
 * Wait for a specific query key invalidation by monitoring network requests
 * 
 * @param page - Playwright page instance
 * @param queryKey - React Query key pattern to wait for (e.g., 'analytics,loans')
 * @param timeout - Maximum time to wait
 */
export async function waitForQueryInvalidation(
  page: Page,
  queryKey: string,
  timeout: number = 10000
) {
  // This is a simplified check - in reality, React Query invalidation happens client-side
  // We can't directly observe it, but we can wait for subsequent API calls
  // For a more accurate test, we'd need to expose invalidation events or use React DevTools
  
  // For now, we'll wait a short time for invalidation to trigger refetch
  await page.waitForTimeout(2000);
}

