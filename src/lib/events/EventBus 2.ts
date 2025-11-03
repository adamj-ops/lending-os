/**
 * Event Bus Implementation
 *
 * PostgreSQL-based event bus for domain-driven architecture.
 * Provides publish/subscribe mechanism for cross-domain communication.
 */

import { db } from '@/db/client';
import { domainEvents, eventHandlers, eventProcessingLog } from '@/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import {
  DomainEvent,
  EventHandler,
  EventHandlerRegistration,
  EventProcessingResult,
  IEventBus,
  EventMetadata,
} from './types';

/**
 * Event Bus Service
 *
 * Singleton service for publishing and subscribing to domain events.
 */
class EventBus implements IEventBus {
  private handlers: Map<string, Map<string, EventHandlerRegistration>> = new Map();
  private sequenceCounters: Map<string, number> = new Map();

  /**
   * Publish a domain event
   *
   * 1. Persists event to database
   * 2. Executes all registered handlers synchronously
   * 3. Logs execution results
   */
  async publish<T>(
    event: Omit<DomainEvent<T>, 'id' | 'occurredAt' | 'sequenceNumber'>
  ): Promise<void> {
    const aggregateKey = `${event.aggregateType}:${event.aggregateId}`;

    // Get next sequence number for this aggregate
    const currentSequence = this.sequenceCounters.get(aggregateKey) ?? 0;
    const sequenceNumber = currentSequence + 1;
    this.sequenceCounters.set(aggregateKey, sequenceNumber);

    // Persist event to database
    const [persistedEvent] = await db
      .insert(domainEvents)
      .values({
        eventType: event.eventType,
        eventVersion: event.eventVersion,
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        payload: event.payload as Record<string, unknown>,
        metadata: event.metadata as Record<string, unknown> | undefined,
        sequenceNumber,
        causationId: event.causationId,
        correlationId: event.correlationId,
        processingStatus: 'pending',
      })
      .returning();

    // Execute handlers
    await this.executeHandlers(persistedEvent.id, event.eventType);

    // Mark event as processed
    await db
      .update(domainEvents)
      .set({
        processingStatus: 'processed',
        processedAt: new Date(),
      })
      .where(eq(domainEvents.id, persistedEvent.id));
  }

  /**
   * Subscribe to an event type
   */
  subscribe<T>(registration: EventHandlerRegistration): void {
    const { eventType, handlerName, handler, priority = 100, isEnabled = true } = registration;

    // Store handler in memory
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Map());
    }
    this.handlers.get(eventType)!.set(handlerName, registration);

    // Persist handler registration to database
    db.insert(eventHandlers)
      .values({
        handlerName,
        eventType,
        priority,
        isEnabled: isEnabled ? 1 : 0,
      })
      .onConflictDoUpdate({
        target: eventHandlers.handlerName,
        set: {
          eventType,
          priority,
          isEnabled: isEnabled ? 1 : 0,
          updatedAt: new Date(),
        },
      })
      .execute()
      .catch((error) => {
        console.error(`Failed to persist handler registration: ${error}`);
      });
  }

  /**
   * Unsubscribe a handler
   */
  unsubscribe(handlerName: string): void {
    // Remove from memory
    for (const handlers of this.handlers.values()) {
      handlers.delete(handlerName);
    }

    // Mark as disabled in database
    db.update(eventHandlers)
      .set({
        isEnabled: 0,
        updatedAt: new Date(),
      })
      .where(eq(eventHandlers.handlerName, handlerName))
      .execute()
      .catch((error) => {
        console.error(`Failed to unsubscribe handler: ${error}`);
      });
  }

  /**
   * Get event history for an aggregate
   */
  async getEventHistory(
    aggregateId: string,
    aggregateType?: string
  ): Promise<DomainEvent[]> {
    const conditions = aggregateType
      ? and(
          eq(domainEvents.aggregateId, aggregateId),
          eq(domainEvents.aggregateType, aggregateType)
        )
      : eq(domainEvents.aggregateId, aggregateId);

    const events = await db
      .select()
      .from(domainEvents)
      .where(conditions)
      .orderBy(asc(domainEvents.sequenceNumber));

    return events.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      eventVersion: event.eventVersion,
      aggregateId: event.aggregateId,
      aggregateType: event.aggregateType,
      payload: event.payload,
      metadata: event.metadata ?? undefined,
      sequenceNumber: event.sequenceNumber,
      causationId: event.causationId ?? undefined,
      correlationId: event.correlationId ?? undefined,
      occurredAt: event.occurredAt,
    })) as DomainEvent[];
  }

  /**
   * Replay events for an aggregate
   *
   * Re-executes all handlers for all events of an aggregate.
   * Useful for rebuilding read models or recovering from errors.
   */
  async replay(aggregateId: string, aggregateType?: string): Promise<void> {
    const events = await this.getEventHistory(aggregateId, aggregateType);

    for (const event of events) {
      await this.executeHandlers(event.id, event.eventType);
    }
  }

  /**
   * Execute all handlers for an event type
   */
  private async executeHandlers(eventId: string, eventType: string): Promise<void> {
    const handlers = this.handlers.get(eventType);
    if (!handlers || handlers.size === 0) {
      return;
    }

    // Sort handlers by priority (lower priority executes first)
    const sortedHandlers = Array.from(handlers.values()).sort(
      (a, b) => (a.priority ?? 100) - (b.priority ?? 100)
    );

    // Execute handlers sequentially
    for (const registration of sortedHandlers) {
      if (!registration.isEnabled) {
        continue;
      }

      await this.executeHandler(eventId, registration);
    }
  }

  /**
   * Execute a single handler
   */
  private async executeHandler(
    eventId: string,
    registration: EventHandlerRegistration
  ): Promise<EventProcessingResult> {
    const startTime = Date.now();
    const { handlerName, handler } = registration;

    try {
      // Get event from database
      const [event] = await db
        .select()
        .from(domainEvents)
        .where(eq(domainEvents.id, eventId));

      if (!event) {
        throw new Error(`Event ${eventId} not found`);
      }

      // Execute handler
      const domainEvent: DomainEvent = {
        id: event.id,
        eventType: event.eventType,
        eventVersion: event.eventVersion,
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        payload: event.payload,
        metadata: (event.metadata as EventMetadata | null) ?? undefined,
        sequenceNumber: event.sequenceNumber,
        causationId: event.causationId ?? undefined,
        correlationId: event.correlationId ?? undefined,
        occurredAt: event.occurredAt,
      };

      await handler(domainEvent);

      const executionTimeMs = Date.now() - startTime;

      // Log success
      await this.logExecution(eventId, handlerName, 'success', executionTimeMs);

      // Update handler statistics
      await this.updateHandlerStatistics(handlerName, true);

      return {
        eventId,
        handlerName,
        status: 'success',
        executionTimeMs,
      };
    } catch (error) {
      const executionTimeMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Log failure
      await this.logExecution(eventId, handlerName, 'failure', executionTimeMs, errorMessage);

      // Update handler statistics
      await this.updateHandlerStatistics(handlerName, false);

      console.error(`Handler ${handlerName} failed for event ${eventId}:`, error);

      return {
        eventId,
        handlerName,
        status: 'failure',
        executionTimeMs,
        error: errorMessage,
      };
    }
  }

  /**
   * Log handler execution
   */
  private async logExecution(
    eventId: string,
    handlerName: string,
    status: 'success' | 'failure' | 'skipped',
    executionTimeMs?: number,
    error?: string
  ): Promise<void> {
    // Get handler ID
    const [handler] = await db
      .select()
      .from(eventHandlers)
      .where(eq(eventHandlers.handlerName, handlerName));

    if (!handler) {
      console.warn(`Handler ${handlerName} not found in database`);
      return;
    }

    await db.insert(eventProcessingLog).values({
      eventId,
      handlerId: handler.id,
      status,
      executionTimeMs,
      error,
    });
  }

  /**
   * Update handler statistics
   */
  private async updateHandlerStatistics(handlerName: string, success: boolean): Promise<void> {
    const [handler] = await db
      .select()
      .from(eventHandlers)
      .where(eq(eventHandlers.handlerName, handlerName));

    if (!handler) {
      return;
    }

    await db
      .update(eventHandlers)
      .set({
        lastExecutedAt: new Date(),
        successCount: success ? handler.successCount + 1 : handler.successCount,
        failureCount: success ? handler.failureCount : handler.failureCount + 1,
        updatedAt: new Date(),
      })
      .where(eq(eventHandlers.id, handler.id));
  }

  /**
   * Initialize sequence counters from database
   *
   * Call this on startup to ensure sequence numbers are correct.
   */
  async initializeSequenceCounters(): Promise<void> {
    const events = await db
      .select({
        aggregateId: domainEvents.aggregateId,
        aggregateType: domainEvents.aggregateType,
        sequenceNumber: domainEvents.sequenceNumber,
      })
      .from(domainEvents)
      .orderBy(desc(domainEvents.sequenceNumber));

    const maxSequences = new Map<string, number>();
    for (const event of events) {
      const key = `${event.aggregateType}:${event.aggregateId}`;
      if (!maxSequences.has(key)) {
        maxSequences.set(key, event.sequenceNumber);
      }
    }

    this.sequenceCounters = maxSequences;
  }
}

// Export singleton instance
export const eventBus = new EventBus();

// Initialize on import (in production, call this explicitly on app startup)
if (typeof window === 'undefined') {
  eventBus.initializeSequenceCounters().catch((error) => {
    console.error('Failed to initialize event bus sequence counters:', error);
  });
}
