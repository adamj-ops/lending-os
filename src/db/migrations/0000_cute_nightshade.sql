CREATE TYPE "public"."borrower_type" AS ENUM('individual', 'entity');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('id', 'tax_return', 'bank_statement', 'other');--> statement-breakpoint
CREATE TYPE "public"."entity_type" AS ENUM('individual', 'company', 'fund', 'ira');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('single_family', 'multi_family', 'commercial', 'land');--> statement-breakpoint
CREATE TYPE "public"."loan_category" AS ENUM('asset_backed', 'yield_note', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."loan_status" AS ENUM('draft', 'submitted', 'verification', 'underwriting', 'approved', 'closing', 'funded', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."payment_frequency" AS ENUM('monthly', 'quarterly', 'maturity');--> statement-breakpoint
CREATE TYPE "public"."payment_type" AS ENUM('interest_only', 'amortized');--> statement-breakpoint
CREATE TYPE "public"."loan_document_type" AS ENUM('application', 'appraisal', 'title', 'insurance', 'closing_docs', 'other');--> statement-breakpoint
CREATE TYPE "public"."payment_method_enum" AS ENUM('wire', 'ach', 'check', 'cash', 'other');--> statement-breakpoint
CREATE TYPE "public"."payment_status_enum" AS ENUM('pending', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."schedule_type_enum" AS ENUM('amortized', 'interest_only', 'balloon');--> statement-breakpoint
CREATE TYPE "public"."draw_status_enum" AS ENUM('requested', 'approved', 'inspected', 'disbursed', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."inspection_status_enum" AS ENUM('scheduled', 'in_progress', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."inspection_type_enum" AS ENUM('progress', 'final', 'quality', 'safety');--> statement-breakpoint
CREATE TYPE "public"."alert_severity" AS ENUM('info', 'warning', 'critical');--> statement-breakpoint
CREATE TYPE "public"."alert_status" AS ENUM('unread', 'read', 'archived');--> statement-breakpoint
CREATE TYPE "public"."capital_call_status" AS ENUM('pending', 'sent', 'funded', 'overdue');--> statement-breakpoint
CREATE TYPE "public"."commitment_status" AS ENUM('pending', 'active', 'fulfilled', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."distribution_status" AS ENUM('scheduled', 'processed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."distribution_type" AS ENUM('return_of_capital', 'profit', 'interest');--> statement-breakpoint
CREATE TYPE "public"."fund_status" AS ENUM('active', 'closed', 'liquidated');--> statement-breakpoint
CREATE TYPE "public"."fund_type" AS ENUM('private', 'syndicated', 'institutional');--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"hashed_password" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"logo_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_organizations" (
	"user_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_organizations_user_id_organization_id_pk" PRIMARY KEY("user_id","organization_id")
);
--> statement-breakpoint
CREATE TABLE "borrower_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"borrower_id" uuid NOT NULL,
	"document_type" "document_type" NOT NULL,
	"file_url" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "borrowers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"type" "borrower_type" DEFAULT 'individual' NOT NULL,
	"first_name" text,
	"last_name" text,
	"name" text,
	"email" text NOT NULL,
	"phone" text,
	"address" text,
	"company_name" text,
	"credit_score" integer,
	"tax_id_encrypted" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lenders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"entity_type" "entity_type" NOT NULL,
	"contact_email" text NOT NULL,
	"contact_phone" text,
	"total_committed" numeric(15, 2) DEFAULT '0' NOT NULL,
	"total_deployed" numeric(15, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip" text NOT NULL,
	"property_type" "property_type" NOT NULL,
	"occupancy" text,
	"estimated_value" numeric(14, 2),
	"purchase_price" numeric(15, 2) NOT NULL,
	"appraised_value" numeric(15, 2),
	"appraisal_date" timestamp with time zone,
	"rehab_budget" numeric(14, 2),
	"photos" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"file_url" text NOT NULL,
	"caption" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
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
CREATE TABLE "loans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"loan_category" "loan_category" DEFAULT 'asset_backed' NOT NULL,
	"borrower_id" uuid,
	"lender_id" uuid,
	"property_id" uuid,
	"property_address" text,
	"principal" numeric(14, 2) NOT NULL,
	"rate" numeric(6, 3) NOT NULL,
	"term_months" integer NOT NULL,
	"payment_type" "payment_type" DEFAULT 'amortized' NOT NULL,
	"payment_frequency" "payment_frequency" DEFAULT 'monthly' NOT NULL,
	"origination_fee_bps" integer DEFAULT 0,
	"late_fee_bps" integer DEFAULT 0,
	"default_interest_bps" integer DEFAULT 0,
	"escrow_enabled" boolean DEFAULT false,
	"status" "loan_status" DEFAULT 'draft' NOT NULL,
	"status_changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"loan_amount" numeric(15, 2),
	"interest_rate" numeric(5, 2),
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"funded_date" timestamp with time zone,
	"maturity_date" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "loan_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loan_id" uuid NOT NULL,
	"document_type" "loan_document_type" NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" text,
	"uploaded_by" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loan_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loan_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "borrower_loans" (
	"borrower_id" uuid NOT NULL,
	"loan_id" uuid NOT NULL,
	"role" text DEFAULT 'primary' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "borrower_loans_borrower_id_loan_id_pk" PRIMARY KEY("borrower_id","loan_id")
);
--> statement-breakpoint
CREATE TABLE "lender_loans" (
	"lender_id" uuid NOT NULL,
	"loan_id" uuid NOT NULL,
	"role" text DEFAULT 'primary' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"percentage" numeric(5, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lender_loans_lender_id_loan_id_pk" PRIMARY KEY("lender_id","loan_id")
);
--> statement-breakpoint
CREATE TABLE "payment_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loan_id" uuid NOT NULL,
	"schedule_type" "schedule_type_enum" NOT NULL,
	"payment_frequency" "payment_frequency" NOT NULL,
	"total_payments" numeric NOT NULL,
	"payment_amount" numeric(14, 2) NOT NULL,
	"schedule_data" text NOT NULL,
	"is_active" numeric DEFAULT '1',
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"generated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loan_id" uuid NOT NULL,
	"payment_type" text NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"principal_amount" numeric(14, 2) DEFAULT '0',
	"interest_amount" numeric(14, 2) DEFAULT '0',
	"fee_amount" numeric(14, 2) DEFAULT '0',
	"payment_method" "payment_method_enum" NOT NULL,
	"status" "payment_status_enum" DEFAULT 'pending',
	"transaction_reference" text,
	"bank_reference" text,
	"check_number" text,
	"payment_date" date NOT NULL,
	"received_date" date,
	"processed_date" timestamp with time zone,
	"notes" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "draw_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loan_id" uuid NOT NULL,
	"total_draws" integer NOT NULL,
	"total_budget" numeric(14, 2) NOT NULL,
	"schedule_data" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "draws" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loan_id" uuid NOT NULL,
	"draw_number" integer NOT NULL,
	"amount_requested" numeric(14, 2) NOT NULL,
	"amount_approved" numeric(14, 2),
	"amount_disbursed" numeric(14, 2),
	"work_description" text NOT NULL,
	"budget_line_item" text,
	"contractor_name" text,
	"contractor_contact" text,
	"status" "draw_status_enum" DEFAULT 'requested',
	"requested_by" uuid,
	"approved_by" uuid,
	"inspected_by" uuid,
	"requested_date" date DEFAULT now(),
	"approved_date" date,
	"inspection_date" date,
	"disbursed_date" date,
	"notes" text,
	"rejection_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "draws_loan_id_draw_number_unique" UNIQUE("loan_id","draw_number")
);
--> statement-breakpoint
CREATE TABLE "inspections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"draw_id" uuid NOT NULL,
	"inspection_type" "inspection_type_enum" NOT NULL,
	"status" "inspection_status_enum" DEFAULT 'scheduled',
	"inspector_name" text NOT NULL,
	"inspector_contact" text,
	"inspection_location" text,
	"work_completion_percentage" integer,
	"quality_rating" integer,
	"safety_compliant" boolean DEFAULT true,
	"findings" text,
	"recommendations" text,
	"photos" text,
	"signatures" text,
	"scheduled_date" date,
	"completed_date" date,
	"inspection_duration_minutes" integer,
	"weather_conditions" text,
	"equipment_used" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domain_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"event_version" text DEFAULT '1.0' NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"aggregate_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"metadata" jsonb,
	"sequence_number" integer NOT NULL,
	"causation_id" uuid,
	"correlation_id" uuid,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	"processing_status" text DEFAULT 'pending' NOT NULL,
	"processing_error" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_handlers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"handler_name" text NOT NULL,
	"event_type" text NOT NULL,
	"is_enabled" integer DEFAULT 1 NOT NULL,
	"priority" integer DEFAULT 100 NOT NULL,
	"last_executed_at" timestamp with time zone,
	"success_count" integer DEFAULT 0 NOT NULL,
	"failure_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_handlers_handler_name_unique" UNIQUE("handler_name")
);
--> statement-breakpoint
CREATE TABLE "event_processing_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"handler_id" uuid NOT NULL,
	"status" text NOT NULL,
	"execution_time_ms" integer,
	"error" text,
	"executed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_ingest" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"domain" text,
	"aggregate_id" uuid,
	"payload" jsonb NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"ingested_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fund_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"snapshot_date" date NOT NULL,
	"total_commitments" numeric(15, 2) DEFAULT '0' NOT NULL,
	"capital_deployed" numeric(15, 2) DEFAULT '0' NOT NULL,
	"avg_investor_yield" numeric(6, 3),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fund_snapshots_snapshot_date_unique" UNIQUE("snapshot_date")
);
--> statement-breakpoint
CREATE TABLE "inspection_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"snapshot_date" date NOT NULL,
	"scheduled_count" integer DEFAULT 0 NOT NULL,
	"completed_count" integer DEFAULT 0 NOT NULL,
	"avg_completion_hours" numeric(6, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inspection_snapshots_snapshot_date_unique" UNIQUE("snapshot_date")
);
--> statement-breakpoint
CREATE TABLE "loan_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"snapshot_date" date NOT NULL,
	"active_count" integer DEFAULT 0 NOT NULL,
	"delinquent_count" integer DEFAULT 0 NOT NULL,
	"avg_ltv" numeric(6, 3),
	"total_principal" numeric(15, 2) DEFAULT '0' NOT NULL,
	"interest_accrued" numeric(14, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "loan_snapshots_snapshot_date_unique" UNIQUE("snapshot_date")
);
--> statement-breakpoint
CREATE TABLE "payment_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"snapshot_date" date NOT NULL,
	"amount_received" numeric(15, 2) DEFAULT '0' NOT NULL,
	"amount_scheduled" numeric(15, 2) DEFAULT '0' NOT NULL,
	"late_count" integer DEFAULT 0 NOT NULL,
	"avg_collection_days" numeric(6, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_snapshots_snapshot_date_unique" UNIQUE("snapshot_date")
);
--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"code" varchar(100) NOT NULL,
	"severity" "alert_severity" DEFAULT 'info' NOT NULL,
	"status" "alert_status" DEFAULT 'unread' NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"read_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fund_calls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fund_id" uuid NOT NULL,
	"call_number" integer NOT NULL,
	"call_amount" numeric(15, 2) NOT NULL,
	"due_date" timestamp with time zone NOT NULL,
	"status" "capital_call_status" DEFAULT 'pending' NOT NULL,
	"purpose" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fund_commitments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fund_id" uuid NOT NULL,
	"lender_id" uuid NOT NULL,
	"committed_amount" numeric(15, 2) NOT NULL,
	"called_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"returned_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"status" "commitment_status" DEFAULT 'pending' NOT NULL,
	"commitment_date" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fund_distributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fund_id" uuid NOT NULL,
	"distribution_date" timestamp with time zone NOT NULL,
	"total_amount" numeric(15, 2) NOT NULL,
	"distribution_type" "distribution_type" NOT NULL,
	"status" "distribution_status" DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fund_loan_allocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fund_id" uuid NOT NULL,
	"loan_id" uuid NOT NULL,
	"allocated_amount" numeric(15, 2) NOT NULL,
	"returned_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"allocation_date" timestamp with time zone NOT NULL,
	"full_return_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "funds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"fund_type" "fund_type" NOT NULL,
	"status" "fund_status" DEFAULT 'active' NOT NULL,
	"total_capacity" numeric(15, 2) NOT NULL,
	"total_committed" numeric(15, 2) DEFAULT '0' NOT NULL,
	"total_deployed" numeric(15, 2) DEFAULT '0' NOT NULL,
	"total_returned" numeric(15, 2) DEFAULT '0' NOT NULL,
	"inception_date" timestamp with time zone NOT NULL,
	"closing_date" timestamp with time zone,
	"liquidation_date" timestamp with time zone,
	"strategy" text,
	"target_return" numeric(5, 2),
	"management_fee_bps" integer DEFAULT 0 NOT NULL,
	"performance_fee_bps" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_organizations" ADD CONSTRAINT "user_organizations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_organizations" ADD CONSTRAINT "user_organizations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "borrower_documents" ADD CONSTRAINT "borrower_documents_borrower_id_borrowers_id_fk" FOREIGN KEY ("borrower_id") REFERENCES "public"."borrowers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "borrowers" ADD CONSTRAINT "borrowers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lenders" ADD CONSTRAINT "lenders_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_photos" ADD CONSTRAINT "property_photos_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collateral" ADD CONSTRAINT "collateral_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loan_terms" ADD CONSTRAINT "loan_terms_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loans" ADD CONSTRAINT "loans_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loans" ADD CONSTRAINT "loans_borrower_id_borrowers_id_fk" FOREIGN KEY ("borrower_id") REFERENCES "public"."borrowers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loans" ADD CONSTRAINT "loans_lender_id_lenders_id_fk" FOREIGN KEY ("lender_id") REFERENCES "public"."lenders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loans" ADD CONSTRAINT "loans_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loan_documents" ADD CONSTRAINT "loan_documents_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loan_notes" ADD CONSTRAINT "loan_notes_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "borrower_loans" ADD CONSTRAINT "borrower_loans_borrower_id_borrowers_id_fk" FOREIGN KEY ("borrower_id") REFERENCES "public"."borrowers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "borrower_loans" ADD CONSTRAINT "borrower_loans_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lender_loans" ADD CONSTRAINT "lender_loans_lender_id_lenders_id_fk" FOREIGN KEY ("lender_id") REFERENCES "public"."lenders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lender_loans" ADD CONSTRAINT "lender_loans_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_schedules" ADD CONSTRAINT "payment_schedules_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_schedules" ADD CONSTRAINT "payment_schedules_generated_by_users_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draw_schedules" ADD CONSTRAINT "draw_schedules_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draw_schedules" ADD CONSTRAINT "draw_schedules_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draws" ADD CONSTRAINT "draws_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draws" ADD CONSTRAINT "draws_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draws" ADD CONSTRAINT "draws_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draws" ADD CONSTRAINT "draws_inspected_by_users_id_fk" FOREIGN KEY ("inspected_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_draw_id_draws_id_fk" FOREIGN KEY ("draw_id") REFERENCES "public"."draws"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_processing_log" ADD CONSTRAINT "event_processing_log_event_id_domain_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."domain_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_processing_log" ADD CONSTRAINT "event_processing_log_handler_id_event_handlers_id_fk" FOREIGN KEY ("handler_id") REFERENCES "public"."event_handlers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_ingest" ADD CONSTRAINT "event_ingest_event_id_domain_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."domain_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fund_calls" ADD CONSTRAINT "fund_calls_fund_id_funds_id_fk" FOREIGN KEY ("fund_id") REFERENCES "public"."funds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fund_commitments" ADD CONSTRAINT "fund_commitments_fund_id_funds_id_fk" FOREIGN KEY ("fund_id") REFERENCES "public"."funds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fund_commitments" ADD CONSTRAINT "fund_commitments_lender_id_lenders_id_fk" FOREIGN KEY ("lender_id") REFERENCES "public"."lenders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fund_distributions" ADD CONSTRAINT "fund_distributions_fund_id_funds_id_fk" FOREIGN KEY ("fund_id") REFERENCES "public"."funds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fund_loan_allocations" ADD CONSTRAINT "fund_loan_allocations_fund_id_funds_id_fk" FOREIGN KEY ("fund_id") REFERENCES "public"."funds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funds" ADD CONSTRAINT "funds_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "borrowers_organization_id_idx" ON "borrowers" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "borrowers_email_idx" ON "borrowers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "lenders_organization_id_idx" ON "lenders" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "lenders_email_idx" ON "lenders" USING btree ("contact_email");--> statement-breakpoint
CREATE INDEX "borrower_loans_is_primary_idx" ON "borrower_loans" USING btree ("is_primary");--> statement-breakpoint
CREATE INDEX "borrower_loans_loan_id_idx" ON "borrower_loans" USING btree ("loan_id");--> statement-breakpoint
CREATE INDEX "lender_loans_is_primary_idx" ON "lender_loans" USING btree ("is_primary");--> statement-breakpoint
CREATE INDEX "lender_loans_loan_id_idx" ON "lender_loans" USING btree ("loan_id");--> statement-breakpoint
CREATE INDEX "payment_schedules_loan_id_idx" ON "payment_schedules" USING btree ("loan_id");--> statement-breakpoint
CREATE INDEX "payment_schedules_is_active_idx" ON "payment_schedules" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "payments_loan_id_idx" ON "payments" USING btree ("loan_id");--> statement-breakpoint
CREATE INDEX "payments_payment_date_idx" ON "payments" USING btree ("payment_date");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payments_payment_method_idx" ON "payments" USING btree ("payment_method");--> statement-breakpoint
CREATE INDEX "draw_schedules_loan_id_idx" ON "draw_schedules" USING btree ("loan_id");--> statement-breakpoint
CREATE INDEX "draw_schedules_is_active_idx" ON "draw_schedules" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "draws_loan_id_idx" ON "draws" USING btree ("loan_id");--> statement-breakpoint
CREATE INDEX "draws_status_idx" ON "draws" USING btree ("status");--> statement-breakpoint
CREATE INDEX "draws_requested_date_idx" ON "draws" USING btree ("requested_date");--> statement-breakpoint
CREATE INDEX "inspections_draw_id_idx" ON "inspections" USING btree ("draw_id");--> statement-breakpoint
CREATE INDEX "inspections_status_idx" ON "inspections" USING btree ("status");--> statement-breakpoint
CREATE INDEX "inspections_completed_date_idx" ON "inspections" USING btree ("completed_date");--> statement-breakpoint
CREATE INDEX "domain_events_event_type_idx" ON "domain_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "domain_events_aggregate_idx" ON "domain_events" USING btree ("aggregate_id","aggregate_type");--> statement-breakpoint
CREATE INDEX "domain_events_occurred_at_idx" ON "domain_events" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "domain_events_processing_status_idx" ON "domain_events" USING btree ("processing_status");--> statement-breakpoint
CREATE INDEX "event_handlers_event_type_idx" ON "event_handlers" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "event_processing_log_event_id_idx" ON "event_processing_log" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_processing_log_executed_at_idx" ON "event_processing_log" USING btree ("executed_at");--> statement-breakpoint
CREATE INDEX "event_ingest_event_type_idx" ON "event_ingest" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "event_ingest_occurred_at_idx" ON "event_ingest" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "fund_snapshots_snapshot_date_idx" ON "fund_snapshots" USING btree ("snapshot_date");--> statement-breakpoint
CREATE INDEX "inspection_snapshots_snapshot_date_idx" ON "inspection_snapshots" USING btree ("snapshot_date");--> statement-breakpoint
CREATE INDEX "loan_snapshots_snapshot_date_idx" ON "loan_snapshots" USING btree ("snapshot_date");--> statement-breakpoint
CREATE INDEX "payment_snapshots_snapshot_date_idx" ON "payment_snapshots" USING btree ("snapshot_date");--> statement-breakpoint
CREATE INDEX "fund_calls_fund_id_idx" ON "fund_calls" USING btree ("fund_id");--> statement-breakpoint
CREATE INDEX "fund_calls_status_idx" ON "fund_calls" USING btree ("status");--> statement-breakpoint
CREATE INDEX "fund_calls_due_date_idx" ON "fund_calls" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "fund_calls_fund_status_idx" ON "fund_calls" USING btree ("fund_id","status");--> statement-breakpoint
CREATE INDEX "fund_commitments_fund_id_idx" ON "fund_commitments" USING btree ("fund_id");--> statement-breakpoint
CREATE INDEX "fund_commitments_lender_id_idx" ON "fund_commitments" USING btree ("lender_id");--> statement-breakpoint
CREATE INDEX "fund_commitments_status_idx" ON "fund_commitments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "fund_commitments_fund_status_idx" ON "fund_commitments" USING btree ("fund_id","status");--> statement-breakpoint
CREATE INDEX "fund_distributions_fund_id_idx" ON "fund_distributions" USING btree ("fund_id");--> statement-breakpoint
CREATE INDEX "fund_distributions_status_idx" ON "fund_distributions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "fund_distributions_date_idx" ON "fund_distributions" USING btree ("distribution_date");--> statement-breakpoint
CREATE INDEX "fund_distributions_fund_type_idx" ON "fund_distributions" USING btree ("fund_id","distribution_type");--> statement-breakpoint
CREATE INDEX "fund_loan_allocations_fund_id_idx" ON "fund_loan_allocations" USING btree ("fund_id");--> statement-breakpoint
CREATE INDEX "fund_loan_allocations_loan_id_idx" ON "fund_loan_allocations" USING btree ("loan_id");--> statement-breakpoint
CREATE INDEX "fund_loan_allocations_fund_loan_idx" ON "fund_loan_allocations" USING btree ("fund_id","loan_id");--> statement-breakpoint
CREATE INDEX "funds_organization_id_idx" ON "funds" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "funds_status_idx" ON "funds" USING btree ("status");--> statement-breakpoint
CREATE INDEX "funds_fund_type_idx" ON "funds" USING btree ("fund_type");