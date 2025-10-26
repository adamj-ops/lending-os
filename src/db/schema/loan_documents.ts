import { pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { loans } from "./loans";

export const loanDocumentTypeEnum = pgEnum("loan_document_type", [
  "application",
  "appraisal",
  "title",
  "insurance",
  "closing_docs",
  "other",
]);

export const loanDocuments = pgTable("loan_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  loanId: uuid("loan_id")
    .notNull()
    .references(() => loans.id, { onDelete: "cascade" }),
  documentType: loanDocumentTypeEnum("document_type").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: text("file_size"),
  uploadedBy: text("uploaded_by"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

