import { pgTable, uuid, varchar, text, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";

export const alertSeverityEnum = pgEnum('alert_severity', ['info', 'warning', 'critical']);
export const alertStatusEnum = pgEnum('alert_status', ['unread', 'read', 'archived']);

export const alerts = pgTable('alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityType: varchar('entity_type', { length: 50 }).notNull(), // 'payment', 'draw', 'inspection', 'loan'
  entityId: uuid('entity_id').notNull(),
  code: varchar('code', { length: 100 }).notNull(), // 'PAYMENT_LATE', 'DRAW_APPROVED', 'INSPECTION_DUE', etc.
  severity: alertSeverityEnum('severity').notNull().default('info'),
  status: alertStatusEnum('status').notNull().default('unread'),
  message: text('message').notNull(),
  metadata: jsonb('metadata'), // Additional context
  createdAt: timestamp('created_at').notNull().defaultNow(),
  readAt: timestamp('read_at'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Alert = typeof alerts.$inferSelect;
export type NewAlert = typeof alerts.$inferInsert;

