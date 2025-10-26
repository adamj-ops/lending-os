-- Hybrid Model Migration: Add role, is_primary, and percentage fields to junction tables
-- This enables primary borrower/lender tracking (direct FK) + co-borrowers/participant lenders (junction)

ALTER TABLE "borrower_loans" ADD COLUMN "role" text DEFAULT 'primary' NOT NULL;--> statement-breakpoint
ALTER TABLE "borrower_loans" ADD COLUMN "is_primary" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "lender_loans" ADD COLUMN "role" text DEFAULT 'primary' NOT NULL;--> statement-breakpoint
ALTER TABLE "lender_loans" ADD COLUMN "is_primary" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "lender_loans" ADD COLUMN "percentage" numeric(5, 2);--> statement-breakpoint

-- Create indexes for performance
CREATE INDEX "borrower_loans_is_primary_idx" ON "borrower_loans" USING btree ("is_primary");--> statement-breakpoint
CREATE INDEX "borrower_loans_loan_id_idx" ON "borrower_loans" USING btree ("loan_id");--> statement-breakpoint
CREATE INDEX "lender_loans_is_primary_idx" ON "lender_loans" USING btree ("is_primary");--> statement-breakpoint
CREATE INDEX "lender_loans_loan_id_idx" ON "lender_loans" USING btree ("loan_id");--> statement-breakpoint

-- Create unique partial indexes to ensure only one primary borrower/lender per loan
CREATE UNIQUE INDEX "borrower_loans_one_primary_per_loan" ON "borrower_loans" ("loan_id") WHERE "is_primary" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "lender_loans_one_primary_per_loan" ON "lender_loans" ("loan_id") WHERE "is_primary" = true;