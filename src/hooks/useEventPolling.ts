'use client';

import { useState, useEffect, useCallback } from 'react';

export interface DomainEvent {
  id: string;
  eventId: string;
  eventType: string;
  domain: string | null;
  aggregateId: string | null;
  aggregateType: string | null;
  payload: Record<string, unknown>;
  metadata: Record<string, unknown> | null;
  occurredAt: string;
  processedAt: string | null;
  processingStatus: string | null;
  processingError: string | null;
  retryCount: number | null;
  createdAt: string;
}

interface UseEventPollingOptions {
  interval?: number; // milliseconds, default 60000 (60s)
  limit?: number; // number of events to fetch, default 20
  enabled?: boolean; // whether polling is enabled, default true
}

export function useEventPolling(options: UseEventPollingOptions = {}) {
  const {
    interval = 60000,
    limit = 20,
    enabled = true,
  } = options;

  const [events, setEvents] = useState<DomainEvent[]>([]);
  const [lastPoll, setLastPoll] = useState<string>(new Date().toISOString());
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const poll = useCallback(async () => {
    if (!enabled) return;

    setIsPolling(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/events/recent?since=${lastPoll}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.events && data.events.length > 0) {
        // Prepend new events and keep last 100
        setEvents(prev => [...data.events, ...prev].slice(0, 100));
        setLastPoll(data.timestamp);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      console.error('Event polling error:', err);
    } finally {
      setIsPolling(false);
    }
  }, [lastPoll, limit, enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Initial poll
    poll();

    // Set up interval
    const intervalId = setInterval(poll, interval);

    return () => clearInterval(intervalId);
  }, [interval, poll, enabled]);

  return {
    events,
    lastPoll,
    isPolling,
    error,
    refresh: poll,
  };
}

