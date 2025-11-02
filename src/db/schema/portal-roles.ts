import { boolean, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { appUsers } from "./auth";

/**
 * Portal Type Enum
 * Defines the three main portals in the application:
 * - ops: Operations portal for admin/staff (full access)
 * - investor: Investor/lender portal (view analytics, loans, distributions)
 * - borrower: Borrower portal (apply for loans, track applications)
 */
export const portalTypeEnum = pgEnum("portal_type", ["ops", "investor", "borrower"]);

/**
 * User Portal Access Table
 * Maps users to organizations with specific portal access and roles.
 * A user can have access to multiple portals across multiple organizations.
 *
 * Example: A user might be:
 * - Admin in ops portal for Organization A
 * - Viewer in investor portal for Organization B
 * - Borrower in borrower portal for Organization C
 */
export const userPortalAccess = pgTable("user_portal_access", {
  id: uuid("id").defaultRandom().primaryKey(),

  // User reference (Clerk user ID)
  userId: text("user_id")
    .references(() => appUsers.id, { onDelete: "cascade" })
    .notNull(),

  // Organization ID (references custom organizations table)
  // NOTE: This references the custom "organizations" table (UUID), not BetterAuth tables
  organizationId: text("organization_id").notNull(),

  // Portal type (ops, investor, or borrower)
  portalType: portalTypeEnum("portal_type").notNull(),

  // Role within this portal
  // Common roles: "admin", "manager", "analyst", "viewer", "member"
  role: text("role").notNull().default("member"),

  // Active status - allows temporarily disabling access without deletion
  isActive: boolean("is_active").default(true).notNull(),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .defaultNow()
    .notNull(),
});

// Export TypeScript types
export type UserPortalAccess = typeof userPortalAccess.$inferSelect;
export type NewUserPortalAccess = typeof userPortalAccess.$inferInsert;
export type PortalType = (typeof portalTypeEnum.enumValues)[number];
