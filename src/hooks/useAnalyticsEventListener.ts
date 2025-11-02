'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getAnalyticsQueryKeysForEvent, hasAnalyticsMapping } from '@/lib/analytics-event-map';

export interface UseAnalyticsEventListenerOptions {
  /**
   * Whether the listener is enabled
   * @default true
   */
  enabled?: boolean;
  
  /**
   * Polling interval in milliseconds
   * @default 30000 (30 seconds)
   */
  interval?: number;
  
  /**
   * Maximum number of events to fetch per poll
   * @default 50
   */
  limit?: number;
  
  /**
   * Filter events by domain (optional)
   */
  domain?: string;
  
  /**
   * Filter events by specific event types (optional)
   * If not provided, all analytics-relevant events will be processed
   */
  eventTypes?: string[];
  
  /**
   * Debounce delay in milliseconds for invalidations
   * Prevents excessive query invalidations when multiple events arrive quickly
   * @default 1000 (1 second)
   */
  debounceMs?: number;
}

export interface UseAnalyticsEventListenerReturn {
  /**
   * Whether the listener is currently connected/active
   */
  isConnected: boolean;
  
  /**
   * Timestamp of the last successful event poll
   */
  lastPoll: Date | null;
  
  /**
   * Number of analytics queries invalidated since hook mount
   */
  invalidationCount: number;
  
  /**
   * Error message if connection/processing failed
   */
  error: string | null;
  
  /**
   * Manually trigger a poll and invalidation
   */
  refresh: () => Promise<void>;
}

/**
 * Hook to listen for domain events and automatically invalidate analytics queries.
 * 
 * This hook polls the events stream endpoint and invalidates React Query cache
 * for analytics queries when relevant domain events are detected.
 * 
 * @example
 * ```tsx
 * const { isConnected, error } = useAnalyticsEventListener({
 *   enabled: true,
 *   interval: 30000,
 *   eventTypes: ['Loan.Funded', 'Payment.Received']
 * });
 * ```
 */
export function useAnalyticsEventListener(
  options: UseAnalyticsEventListenerOptions = {}
): UseAnalyticsEventListenerReturn {
  const {
    enabled = true,
    interval = 30000, // 30 seconds default
    limit = 50,
    domain,
    eventTypes,
    debounceMs = 1000, // 1 second debounce
  } = options;

  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [lastPoll, setLastPoll] = useState<Date | null>(null);
  const [invalidationCount, setInvalidationCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Track last processed event timestamp to avoid re-processing
  const lastProcessedTimestampRef = useRef<string>('');
  
  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Pending invalidations accumulator
  const pendingInvalidationsRef = useRef<Set<string>>(new Set());

  /**
   * Process invalidations with debouncing
   */
  const processInvalidations = useCallback(() => {
    if (pendingInvalidationsRef.current.size === 0) return;

    // Collect all unique query keys to invalidate
    const queryKeysToInvalidate = Array.from(pendingInvalidationsRef.current);
    
    // Clear pending invalidations
    pendingInvalidationsRef.current.clear();
    
    // Invalidate each query key
    queryKeysToInvalidate.forEach(queryKey => {
      // Convert string array representation to actual array
      // e.g., "analytics,loans" -> ["analytics", "loans"]
      const keys = queryKey.split(',');
      queryClient.invalidateQueries({ queryKey: keys });
    });
    
    setInvalidationCount(prev => prev + queryKeysToInvalidate.length);
  }, [queryClient]);

  /**
   * Schedule debounced invalidation
   */
  const scheduleInvalidation = useCallback((queryKeys: string[][]) => {
    // Add query keys to pending set (convert arrays to strings for Set)
    queryKeys.forEach(keys => {
      pendingInvalidationsRef.current.add(keys.join(','));
    });
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Schedule new invalidation
    debounceTimerRef.current = setTimeout(() => {
      processInvalidations();
    }, debounceMs);
  }, [debounceMs, processInvalidations]);

  /**
   * Poll events from the stream endpoint
   */
  const pollEvents = useCallback(async () => {
    if (!enabled) return;

    try {
      setError(null);
      
      // Build query parameters for recent events endpoint
      const params = new URLSearchParams();
      params.set('limit', limit.toString());
      if (domain) params.set('domain', domain);
      if (eventTypes && eventTypes.length > 0) {
        // Note: API may not support multiple eventTypes on server; we filter client-side
        params.set('eventType', eventTypes[0]);
      }
      if (lastPoll) {
        // Ask server only for events strictly newer than last poll timestamp
        params.set('since', lastPoll.toISOString());
      }

      const response = await fetch(`/api/v1/events/recent?${params.toString()}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - please check authentication');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const events = data.events || [];
      
      // Filter events by analytics relevance and event types
      const relevantEvents = events.filter((event: any) => {
        // Check if event has analytics mapping
        if (!hasAnalyticsMapping(event.eventType)) {
          return false;
        }
        
        // If specific event types provided, filter by them
        if (eventTypes && eventTypes.length > 0) {
          return eventTypes.includes(event.eventType);
        }
        
        return true;
      });
      
      // Process each relevant event
      for (const event of relevantEvents) {
        // Skip if we've already processed this event
        const eventId = `${event.eventId}-${event.occurredAt}`;
        if (eventId === lastProcessedTimestampRef.current) {
          continue;
        }
        
        // Get query keys to invalidate for this event
        const queryKeys = getAnalyticsQueryKeysForEvent(event.eventType);
        
        if (queryKeys.length > 0) {
          scheduleInvalidation(queryKeys);
        }
        
        // Update last processed
        lastProcessedTimestampRef.current = eventId;
      }
      
      setIsConnected(true);
      // Advance the polling cursor to the latest occurredAt from this batch
      const latestOccurredAt = events.reduce((max: number, evt: any) => {
        const ts = evt?.occurredAt ? Date.parse(evt.occurredAt) : 0;
        return ts > max ? ts : max;
      }, 0);
      if (latestOccurredAt > 0) {
        setLastPoll(new Date(latestOccurredAt));
      } else {
        setLastPoll(new Date());
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      setIsConnected(false);
      console.error('[useAnalyticsEventListener] Polling error:', err);
    }
  }, [enabled, limit, domain, eventTypes, scheduleInvalidation, lastPoll]);

  /**
   * Manual refresh function
   */
  const refresh = useCallback(async () => {
    await pollEvents();
  }, [pollEvents]);

  // Set up polling interval
  useEffect(() => {
    if (!enabled) {
      setIsConnected(false);
      return;
    }

    // Initial poll
    pollEvents();

    // Set up interval
    const intervalId = setInterval(pollEvents, interval);

    return () => {
      clearInterval(intervalId);
      // Process any pending invalidations on cleanup
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      processInvalidations();
    };
  }, [enabled, interval, pollEvents, processInvalidations]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    lastPoll,
    invalidationCount,
    error,
    refresh,
  };
}
