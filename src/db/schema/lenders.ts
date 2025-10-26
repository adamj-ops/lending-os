import { pgTable, text, timestamp, uuid, numeric, pgEnum, index } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const entityTypeEnum = pgEnum("entity_type", [
  "individual",
  "company",
  "fund",
  "ira",
]);

export const lenders = pgTable("lenders", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  entityType: entityTypeEnum("entity_type").notNull(),

  // Contact
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),

  // v2: Investment tracking
  totalCommitted: numeric("total_committed", { precision: 15, scale: 2 }).notNull().default("0"),
  totalDeployed: numeric("total_deployed", { precision: 15, scale: 2 }).notNull().default("0"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  // Indexes for Epic E2
  organizationIdx: index("lenders_organization_id_idx").on(table.organizationId),
  emailIdx: index("lenders_email_idx").on(table.contactEmail),
}));

