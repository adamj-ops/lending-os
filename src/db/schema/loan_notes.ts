import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { loans } from "./loans";

export const loanNotes = pgTable("loan_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  loanId: uuid("loan_id")
    .notNull()
    .references(() => loans.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

