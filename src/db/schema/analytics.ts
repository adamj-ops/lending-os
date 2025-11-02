import { pgTable, uuid, numeric, integer, text, date, timestamp, index, jsonb, unique } from "drizzle-orm/pg-core";
import { domainEvents } from "./domain_events";

/**
 * fund_snapshots
 * Domain-partitioned snapshot of fund-level KPIs
 */
export const fundSnapshots = pgTable(
  "fund_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    snapshotDate: date("snapshot_date").notNull().unique(),

    totalCommitments: numeric("total_commitments", { precision: 15, scale: 2 }).notNull().default("0"),
    capitalDeployed: numeric("capital_deployed", { precision: 15, scale: 2 }).notNull().default("0"),
    avgInvestorYield: numeric("avg_investor_yield", { precision: 6, scale: 3 }),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    dateIdx: index("fund_snapshots_snapshot_date_idx").on(table.snapshotDate),
  })
);

/**
 * loan_snapshots
 * Portfolio-level aggregates for loans
 */
export const loanSnapshots = pgTable(
  "loan_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    snapshotDate: date("snapshot_date").notNull().unique(),

    activeCount: integer("active_count").notNull().default(0),
    delinquentCount: integer("delinquent_count").notNull().default(0),
    avgLtv: numeric("avg_ltv", { precision: 6, scale: 3 }),
    totalPrincipal: numeric("total_principal", { precision: 15, scale: 2 }).notNull().default("0"),
    interestAccrued: numeric("interest_accrued", { precision: 14, scale: 2 }).notNull().default("0"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    dateIdx: index("loan_snapshots_snapshot_date_idx").on(table.snapshotDate),
  })
);

/**
 * payment_snapshots
 * Collections and cash flow KPIs
 */
export const paymentSnapshots = pgTable(
  "payment_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    snapshotDate: date("snapshot_date").notNull().unique(),

    amountReceived: numeric("amount_received", { precision: 15, scale: 2 }).notNull().default("0"),
    amountScheduled: numeric("amount_scheduled", { precision: 15, scale: 2 }).notNull().default("0"),
    lateCount: integer("late_count").notNull().default(0),
    avgCollectionDays: numeric("avg_collection_days", { precision: 6, scale: 2 }),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    dateIdx: index("payment_snapshots_snapshot_date_idx").on(table.snapshotDate),
  })
);

/**
 * inspection_snapshots
 * Inspector throughput/productivity KPIs
 */
export const inspectionSnapshots = pgTable(
  "inspection_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    snapshotDate: date("snapshot_date").notNull().unique(),

    scheduledCount: integer("scheduled_count").notNull().default(0),
    completedCount: integer("completed_count").notNull().default(0),
    avgCompletionHours: numeric("avg_completion_hours", { precision: 6, scale: 2 }),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    dateIdx: index("inspection_snapshots_snapshot_date_idx").on(table.snapshotDate),
  })
);

/**
 * event_ingest
 * Lightweight projection of domain events used by analytics for incremental updates
 */
export const eventIngest = pgTable(
  "event_ingest",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id").notNull().references(() => domainEvents.id, { onDelete: "cascade" }),

    eventType: text("event_type").notNull(),
    domain: text("domain"),
    aggregateId: uuid("aggregate_id"),
    payload: jsonb("payload").notNull(),

    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    ingestedAt: timestamp("ingested_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    eventTypeIdx: index("event_ingest_event_type_idx").on(table.eventType),
    occurredAtIdx: index("event_ingest_occurred_at_idx").on(table.occurredAt),
  })
);
