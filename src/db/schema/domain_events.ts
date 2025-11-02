import { pgTable, text, timestamp, uuid, jsonb, integer, index } from "drizzle-orm/pg-core";

/**
 * Domain Events Table
 *
 * Stores all domain events for event sourcing and cross-domain communication.
 * Events are immutable once created and provide a complete audit trail.
 */
export const domainEvents = pgTable("domain_events", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Event identification
  eventType: text("event_type").notNull(), // e.g., "Loan.Funded", "Payment.Scheduled"
  eventVersion: text("event_version").notNull().default("1.0"), // For schema evolution

  // Aggregate identification (what entity this event relates to)
  aggregateId: uuid("aggregate_id").notNull(), // e.g., loan_id, payment_id
  aggregateType: text("aggregate_type").notNull(), // e.g., "Loan", "Payment"

  // Event payload
  payload: jsonb("payload").notNull(), // The actual event data
  metadata: jsonb("metadata"), // Additional context (user, IP, etc.)

  // Event ordering and causality
  sequenceNumber: integer("sequence_number").notNull(), // Auto-incrementing per aggregate
  causationId: uuid("causation_id"), // ID of the command that caused this event
  correlationId: uuid("correlation_id"), // ID to group related events

  // Timestamps
  occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }), // When handlers completed

  // Processing status
  processingStatus: text("processing_status").notNull().default("pending"), // 'pending' | 'processing' | 'processed' | 'failed'
  processingError: text("processing_error"), // Error message if processing failed
  retryCount: integer("retry_count").notNull().default(0),

  // Audit
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  // Indexes for efficient querying
  eventTypeIdx: index("domain_events_event_type_idx").on(table.eventType),
  aggregateIdx: index("domain_events_aggregate_idx").on(table.aggregateId, table.aggregateType),
  occurredAtIdx: index("domain_events_occurred_at_idx").on(table.occurredAt),
  processingStatusIdx: index("domain_events_processing_status_idx").on(table.processingStatus),
}));

/**
 * Event Handlers Registry
 *
 * Tracks which handlers are registered for which event types.
 * Used for debugging and monitoring event processing.
 */
export const eventHandlers = pgTable("event_handlers", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Handler identification
  handlerName: text("handler_name").notNull().unique(), // e.g., "PaymentScheduleCreator"
  eventType: text("event_type").notNull(), // e.g., "Loan.Funded"

  // Handler status
  isEnabled: integer("is_enabled").notNull().default(1), // 0 = disabled, 1 = enabled
  priority: integer("priority").notNull().default(100), // Lower numbers execute first

  // Statistics
  lastExecutedAt: timestamp("last_executed_at", { withTimezone: true }),
  successCount: integer("success_count").notNull().default(0),
  failureCount: integer("failure_count").notNull().default(0),

  // Audit
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  eventTypeIdx: index("event_handlers_event_type_idx").on(table.eventType),
}));

/**
 * Event Processing Log
 *
 * Detailed log of each event handler execution.
 * Used for debugging and monitoring.
 */
export const eventProcessingLog = pgTable("event_processing_log", {
  id: uuid("id").defaultRandom().primaryKey(),

  // References
  eventId: uuid("event_id").notNull().references(() => domainEvents.id, { onDelete: "cascade" }),
  handlerId: uuid("handler_id").notNull().references(() => eventHandlers.id, { onDelete: "cascade" }),

  // Execution details
  status: text("status").notNull(), // 'success' | 'failure' | 'skipped'
  executionTimeMs: integer("execution_time_ms"), // How long the handler took
  error: text("error"), // Error message if failed

  // Audit
  executedAt: timestamp("executed_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  eventIdIdx: index("event_processing_log_event_id_idx").on(table.eventId),
  executedAtIdx: index("event_processing_log_executed_at_idx").on(table.executedAt),
}));
