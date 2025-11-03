/**
 * Analytics Event Map
 * 
 * Maps domain event types to React Query keys that should be invalidated
 * when those events occur. This enables selective cache invalidation for
 * analytics data without tight coupling between event types and query keys.
 * 
 * Usage:
 *   import { ANALYTICS_EVENT_MAP } from '@/lib/analytics-event-map';
 *   const queryKeys = ANALYTICS_EVENT_MAP['Loan.Funded'] || [];
 */

/**
 * Mapping of event types to arrays of React Query key arrays to invalidate.
 * 
 * Each entry maps an event type string to an array of query key arrays.
 * Each query key array will be passed to queryClient.invalidateQueries().
 * 
 * Example:
 *   'Loan.Funded' → [['analytics', 'loans'], ['analytics', 'funds']]
 *   This will invalidate both ['analytics', 'loans'] and ['analytics', 'funds'] queries.
 */
export const ANALYTICS_EVENT_MAP: Record<string, string[][]> = {
  // Loan events
  'Loan.Funded': [
    ['analytics', 'loans'],
    ['analytics', 'funds'],
  ],
  
  'Loan.Created': [
    ['analytics', 'loans'],
  ],
  
  'Loan.StatusChanged': [
    ['analytics', 'loans'],
  ],
  
  // Payment events
  'Payment.Received': [
    ['analytics', 'payments'],
    ['analytics', 'loans'],
  ],
  
  'Payment.Processed': [
    ['analytics', 'payments'],
    ['analytics', 'loans'],
  ],
  
  'Payment.Scheduled': [
    ['analytics', 'payments'],
  ],
  
  'Payment.Failed': [
    ['analytics', 'payments'],
    ['analytics', 'loans'],
  ],
  
  // Inspection events
  'Inspection.Completed': [
    ['analytics', 'inspections'],
  ],
  
  'Inspection.Scheduled': [
    ['analytics', 'inspections'],
  ],
  
  // Fund events
  'Fund.Created': [
    ['analytics', 'funds'],
  ],
  
  'Fund.Updated': [
    ['analytics', 'funds'],
  ],
  
  'Fund.Closed': [
    ['analytics', 'funds'],
  ],
  
  'Fund.CommitmentAdded': [
    ['analytics', 'funds'],
  ],
  
  'Commitment.Activated': [
    ['analytics', 'funds'],
  ],
  
  'Fund.CommitmentCancelled': [
    ['analytics', 'funds'],
  ],
  
  'Fund.CapitalCalled': [
    ['analytics', 'funds'],
  ],
  
  'Fund.CapitalReceived': [
    ['analytics', 'funds'],
  ],
  
  'Fund.CapitalAllocated': [
    ['analytics', 'funds'],
    ['analytics', 'loans'],
  ],
  
  'Fund.CapitalReturned': [
    ['analytics', 'funds'],
    ['analytics', 'loans'],
  ],
  
  'Fund.DistributionMade': [
    ['analytics', 'funds'],
  ],
  
  'Distribution.Posted': [
    ['analytics', 'funds'],
  ],
  
  'CapitalEvent.Recorded': [
    ['analytics', 'funds'],
  ],
  
  // Draw events (may affect loan analytics)
  'Draw.Approved': [
    ['analytics', 'loans'],
  ],
  
  'Draw.Disbursed': [
    ['analytics', 'loans'],
  ],
};

/**
 * Get query keys to invalidate for a given event type.
 * 
 * @param eventType - The domain event type (e.g., 'Loan.Funded')
 * @returns Array of query key arrays to invalidate, or empty array if no mapping exists
 */
export function getAnalyticsQueryKeysForEvent(eventType: string): string[][] {
  return ANALYTICS_EVENT_MAP[eventType] || [];
}

/**
 * Check if an event type has analytics mappings.
 * 
 * @param eventType - The domain event type
 * @returns True if the event type has analytics query keys mapped
 */
export function hasAnalyticsMapping(eventType: string): boolean {
  return eventType in ANALYTICS_EVENT_MAP;
}

/**
 * Get all event types that affect a specific analytics domain.
 * 
 * @param domain - The analytics domain ('loans', 'funds', 'payments', 'inspections')
 * @returns Array of event types that invalidate queries for this domain
 */
export function getEventTypesForDomain(domain: string): string[] {
  const eventTypes: string[] = [];
  
  for (const [eventType, queryKeys] of Object.entries(ANALYTICS_EVENT_MAP)) {
    if (queryKeys.some(keys => keys.includes(domain))) {
      eventTypes.push(eventType);
    }
  }
  
  return eventTypes;
}

