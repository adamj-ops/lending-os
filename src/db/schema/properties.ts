import { pgTable, text, timestamp, uuid, numeric, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const propertyTypeEnum = pgEnum("property_type", [
  "single_family",
  "multi_family",
  "commercial",
  "land",
]);

export const properties = pgTable("properties", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  
  // Location
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  
  // Property details
  propertyType: propertyTypeEnum("property_type").notNull(),
  occupancy: text("occupancy"), // v2: 'owner_occupied' | 'tenant_occupied' | 'vacant'
  
  // Valuation
  estimatedValue: numeric("estimated_value", { precision: 14, scale: 2 }), // v2
  purchasePrice: numeric("purchase_price", { precision: 15, scale: 2 }).notNull(),
  appraisedValue: numeric("appraised_value", { precision: 15, scale: 2 }),
  appraisalDate: timestamp("appraisal_date", { withTimezone: true }),
  
  // Construction/rehab
  rehabBudget: numeric("rehab_budget", { precision: 14, scale: 2 }), // v2
  
  // Photos stored as JSONB array of {key, url}
  photos: jsonb("photos").$type<Array<{ key: string; url?: string }>>(), // v2
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const propertyPhotos = pgTable("property_photos", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  fileUrl: text("file_url").notNull(),
  caption: text("caption"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

