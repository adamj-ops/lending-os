CREATE TYPE "public"."borrower_type" AS ENUM('individual', 'entity');--> statement-breakpoint
CREATE TYPE "public"."loan_category" AS ENUM('asset_backed', 'yield_note', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."payment_frequency" AS ENUM('monthly', 'quarterly', 'maturity');--> statement-breakpoint
CREATE TYPE "public"."payment_type" AS ENUM('interest_only', 'amortized');--> statement-breakpoint
ALTER TYPE "public"."entity_type" ADD VALUE 'ira';--> statement-breakpoint
CREATE TABLE "collateral" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loan_id" uuid NOT NULL,
	"lien_position" text,
	"description" text,
	"draw_schedule" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loan_terms" (
	"loan_id" uuid PRIMARY KEY NOT NULL,
	"amortization_months" integer,
	"compounding" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "borrower_loans" (
	"borrower_id" uuid NOT NULL,
	"loan_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "borrower_loans_borrower_id_loan_id_pk" PRIMARY KEY("borrower_id","loan_id")
);
--> statement-breakpoint
CREATE TABLE "lender_loans" (
	"lender_id" uuid NOT NULL,
	"loan_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lender_loans_lender_id_loan_id_pk" PRIMARY KEY("lender_id","loan_id")
);
--> statement-breakpoint
ALTER TABLE "properties" DROP CONSTRAINT "properties_loan_id_loans_id_fk";
--> statement-breakpoint
ALTER TABLE "loans" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "loans" ALTER COLUMN "status" SET DEFAULT 'draft'::text;--> statement-breakpoint
-- Migrate existing "active" status to "funded" before enum conversion
UPDATE "loans" SET "status" = 'funded' WHERE "status" = 'active';--> statement-breakpoint
DROP TYPE "public"."loan_status";--> statement-breakpoint
CREATE TYPE "public"."loan_status" AS ENUM('draft', 'submitted', 'verification', 'underwriting', 'approved', 'closing', 'funded', 'rejected');--> statement-breakpoint
ALTER TABLE "loans" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."loan_status";--> statement-breakpoint
ALTER TABLE "loans" ALTER COLUMN "status" SET DATA TYPE "public"."loan_status" USING "status"::"public"."loan_status";--> statement-breakpoint
ALTER TABLE "borrowers" ALTER COLUMN "first_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "borrowers" ALTER COLUMN "last_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "borrowers" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "borrowers" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "borrowers" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "borrowers" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "lenders" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "lenders" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "lenders" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "lenders" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "appraisal_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "loans" ALTER COLUMN "property_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "loans" ALTER COLUMN "loan_amount" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "loans" ALTER COLUMN "interest_rate" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "loans" ALTER COLUMN "status_changed_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "loans" ALTER COLUMN "status_changed_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "loans" ALTER COLUMN "funded_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "loans" ALTER COLUMN "maturity_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "loans" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "loans" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "loans" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "loans" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "borrowers" ADD COLUMN "type" "borrower_type" DEFAULT 'individual' NOT NULL;--> statement-breakpoint
ALTER TABLE "borrowers" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "borrowers" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "borrowers" ADD COLUMN "tax_id_encrypted" text;--> statement-breakpoint
ALTER TABLE "lenders" ADD COLUMN "contact_phone" text;--> statement-breakpoint
-- Add organization_id as nullable first
ALTER TABLE "properties" ADD COLUMN "organization_id" uuid;--> statement-breakpoint
-- Populate organization_id from related loans
UPDATE "properties" SET "organization_id" = (
  SELECT "organization_id" FROM "loans" WHERE "loans"."property_id" = "properties"."id" LIMIT 1
) WHERE "organization_id" IS NULL;--> statement-breakpoint
-- Set default organization_id for orphaned properties (if any exist)
UPDATE "properties" SET "organization_id" = (
  SELECT "id" FROM "organizations" LIMIT 1
) WHERE "organization_id" IS NULL;--> statement-breakpoint
-- Now make it NOT NULL
ALTER TABLE "properties" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "occupancy" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "estimated_value" numeric(14, 2);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "rehab_budget" numeric(14, 2);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "photos" jsonb;--> statement-breakpoint
ALTER TABLE "loans" ADD COLUMN "loan_category" "loan_category" DEFAULT 'asset_backed' NOT NULL;--> statement-breakpoint
-- Add principal and rate as nullable first, then copy from old columns
ALTER TABLE "loans" ADD COLUMN "principal" numeric(14, 2);--> statement-breakpoint
ALTER TABLE "loans" ADD COLUMN "rate" numeric(6, 3);--> statement-breakpoint
-- Copy data from old columns to new columns
UPDATE "loans" SET "principal" = "loan_amount" WHERE "loan_amount" IS NOT NULL;--> statement-breakpoint
UPDATE "loans" SET "rate" = "interest_rate" WHERE "interest_rate" IS NOT NULL;--> statement-breakpoint
-- Now make them NOT NULL
ALTER TABLE "loans" ALTER COLUMN "principal" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "loans" ALTER COLUMN "rate" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "loans" ADD COLUMN "payment_type" "payment_type" DEFAULT 'amortized' NOT NULL;--> statement-breakpoint
ALTER TABLE "loans" ADD COLUMN "payment_frequency" "payment_frequency" DEFAULT 'monthly' NOT NULL;--> statement-breakpoint
ALTER TABLE "loans" ADD COLUMN "origination_fee_bps" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "loans" ADD COLUMN "late_fee_bps" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "loans" ADD COLUMN "default_interest_bps" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "loans" ADD COLUMN "escrow_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "loans" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "collateral" ADD CONSTRAINT "collateral_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loan_terms" ADD CONSTRAINT "loan_terms_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "borrower_loans" ADD CONSTRAINT "borrower_loans_borrower_id_borrowers_id_fk" FOREIGN KEY ("borrower_id") REFERENCES "public"."borrowers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "borrower_loans" ADD CONSTRAINT "borrower_loans_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lender_loans" ADD CONSTRAINT "lender_loans_lender_id_lenders_id_fk" FOREIGN KEY ("lender_id") REFERENCES "public"."lenders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lender_loans" ADD CONSTRAINT "lender_loans_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "borrowers_organization_id_idx" ON "borrowers" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "borrowers_email_idx" ON "borrowers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "lenders_organization_id_idx" ON "lenders" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "lenders_email_idx" ON "lenders" USING btree ("contact_email");--> statement-breakpoint
ALTER TABLE "properties" DROP COLUMN "loan_id";