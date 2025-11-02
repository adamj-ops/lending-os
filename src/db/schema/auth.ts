/**
 * Application Users Table
 * 
 * This table is synchronized with Clerk authentication.
 * Users are created via Clerk webhook or defensive bootstrap.
 * 
 * Migration: BetterAuth → Clerk (completed via migrations 001-002)
 */

import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

/**
 * Application users synchronized from Clerk
 * This is the primary user table referenced by all foreign keys.
 */
export const appUsers = pgTable("app_users", {
  id: text("id").primaryKey(), // Clerk user ID
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  imageUrl: text("image_url"),
  
  // Soft delete support (preserve audit trail)
  deletedAt: timestamp("deleted_at"),
  isActive: boolean("is_active").default(true).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/**
 * @deprecated Legacy BetterAuth user table - kept for historical reference only
 * Renamed to user_legacy via migration 002.
 * All foreign keys now reference app_users instead.
 */
export const userLegacy = pgTable("user_legacy", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// TypeScript types for app_users
export type AppUser = typeof appUsers.$inferSelect;
export type NewAppUser = typeof appUsers.$inferInsert;
