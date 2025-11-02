import { pgTable, index, foreignKey, uuid, text, integer, timestamp, numeric, jsonb, unique, boolean, date, varchar, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const alertSeverity = pgEnum("alert_severity", ['info', 'warning', 'critical'])
export const alertStatus = pgEnum("alert_status", ['unread', 'read', 'archived'])
export const borrowerType = pgEnum("borrower_type", ['individual', 'entity'])
export const capitalCallStatus = pgEnum("capital_call_status", ['pending', 'sent', 'funded', 'overdue'])
export const commitmentStatus = pgEnum("commitment_status", ['pending', 'active', 'fulfilled', 'cancelled'])
export const distributionStatus = pgEnum("distribution_status", ['scheduled', 'processed', 'cancelled'])
export const distributionType = pgEnum("distribution_type", ['return_of_capital', 'profit', 'interest'])
export const documentType = pgEnum("document_type", ['id', 'tax_return', 'bank_statement', 'other'])
export const drawStatusEnum = pgEnum("draw_status_enum", ['requested', 'approved', 'inspected', 'disbursed', 'rejected'])
export const entityType = pgEnum("entity_type", ['individual', 'company', 'fund', 'ira'])
export const fundStatus = pgEnum("fund_status", ['active', 'closed', 'liquidated'])
export const fundType = pgEnum("fund_type", ['private', 'syndicated', 'institutional'])
export const inspectionStatusEnum = pgEnum("inspection_status_enum", ['scheduled', 'in_progress', 'completed', 'failed'])
export const inspectionTypeEnum = pgEnum("inspection_type_enum", ['progress', 'final', 'quality', 'safety'])
export const loanCategory = pgEnum("loan_category", ['asset_backed', 'yield_note', 'hybrid'])
export const loanDocumentType = pgEnum("loan_document_type", ['application', 'appraisal', 'title', 'insurance', 'closing_docs', 'other'])
export const loanStatus = pgEnum("loan_status", ['draft', 'submitted', 'verification', 'underwriting', 'approved', 'closing', 'funded', 'rejected'])
export const paymentFrequency = pgEnum("payment_frequency", ['monthly', 'quarterly', 'maturity'])
export const paymentMethodEnum = pgEnum("payment_method_enum", ['wire', 'ach', 'check', 'cash', 'other'])
export const paymentStatusEnum = pgEnum("payment_status_enum", ['pending', 'completed', 'failed', 'cancelled'])
export const paymentType = pgEnum("payment_type", ['interest_only', 'amortized'])
export const portalType = pgEnum("portal_type", ['ops', 'investor', 'borrower'])
export const propertyType = pgEnum("property_type", ['single_family', 'multi_family', 'commercial', 'land'])
export const scheduleTypeEnum = pgEnum("schedule_type_enum", ['amortized', 'interest_only', 'balloon'])


export const borrowers = pgTable("borrowers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	type: borrowerType().default('individual').notNull(),
	firstName: text("first_name"),
	lastName: text("last_name"),
	name: text(),
	email: text().notNull(),
	phone: text(),
	address: text(),
	companyName: text("company_name"),
	creditScore: integer("credit_score"),
	taxIdEncrypted: text("tax_id_encrypted"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("borrowers_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("borrowers_organization_id_idx").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "borrowers_organization_id_organizations_id_fk"
		}).onDelete("cascade"),
]);

export const organizations = pgTable("organizations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	logoUrl: text("logo_url"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const lenders = pgTable("lenders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	name: text().notNull(),
	entityType: entityType("entity_type").notNull(),
	contactEmail: text("contact_email").notNull(),
	contactPhone: text("contact_phone"),
	totalCommitted: numeric("total_committed", { precision: 15, scale:  2 }).default('0').notNull(),
	totalDeployed: numeric("total_deployed", { precision: 15, scale:  2 }).default('0').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("lenders_email_idx").using("btree", table.contactEmail.asc().nullsLast().op("text_ops")),
	index("lenders_organization_id_idx").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "lenders_organization_id_organizations_id_fk"
		}).onDelete("cascade"),
]);

export const properties = pgTable("properties", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	address: text().notNull(),
	city: text().notNull(),
	state: text().notNull(),
	zip: text().notNull(),
	propertyType: propertyType("property_type").notNull(),
	occupancy: text(),
	estimatedValue: numeric("estimated_value", { precision: 14, scale:  2 }),
	purchasePrice: numeric("purchase_price", { precision: 15, scale:  2 }).notNull(),
	appraisedValue: numeric("appraised_value", { precision: 15, scale:  2 }),
	appraisalDate: timestamp("appraisal_date", { withTimezone: true, mode: 'string' }),
	rehabBudget: numeric("rehab_budget", { precision: 14, scale:  2 }),
	photos: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "properties_organization_id_organizations_id_fk"
		}).onDelete("cascade"),
]);

export const propertyPhotos = pgTable("property_photos", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	propertyId: uuid("property_id").notNull(),
	fileUrl: text("file_url").notNull(),
	caption: text(),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.propertyId],
			foreignColumns: [properties.id],
			name: "property_photos_property_id_properties_id_fk"
		}).onDelete("cascade"),
]);

export const roles = pgTable("roles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("roles_name_unique").on(table.name),
]);

export const collateral = pgTable("collateral", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	loanId: uuid("loan_id").notNull(),
	lienPosition: text("lien_position"),
	description: text(),
	drawSchedule: jsonb("draw_schedule"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.loanId],
			foreignColumns: [loans.id],
			name: "collateral_loan_id_loans_id_fk"
		}).onDelete("cascade"),
]);

export const loanTerms = pgTable("loan_terms", {
	loanId: uuid("loan_id").primaryKey().notNull(),
	amortizationMonths: integer("amortization_months"),
	compounding: text(),
	notes: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.loanId],
			foreignColumns: [loans.id],
			name: "loan_terms_loan_id_loans_id_fk"
		}).onDelete("cascade"),
]);

export const loans = pgTable("loans", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	loanCategory: loanCategory("loan_category").default('asset_backed').notNull(),
	borrowerId: uuid("borrower_id"),
	lenderId: uuid("lender_id"),
	propertyId: uuid("property_id"),
	propertyAddress: text("property_address"),
	principal: numeric({ precision: 14, scale:  2 }).notNull(),
	rate: numeric({ precision: 6, scale:  3 }).notNull(),
	termMonths: integer("term_months").notNull(),
	paymentType: paymentType("payment_type").default('amortized').notNull(),
	paymentFrequency: paymentFrequency("payment_frequency").default('monthly').notNull(),
	originationFeeBps: integer("origination_fee_bps").default(0),
	lateFeeBps: integer("late_fee_bps").default(0),
	defaultInterestBps: integer("default_interest_bps").default(0),
	escrowEnabled: boolean("escrow_enabled").default(false),
	status: loanStatus().default('draft').notNull(),
	statusChangedAt: timestamp("status_changed_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	loanAmount: numeric("loan_amount", { precision: 15, scale:  2 }),
	interestRate: numeric("interest_rate", { precision: 5, scale:  2 }),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	fundedDate: timestamp("funded_date", { withTimezone: true, mode: 'string' }),
	maturityDate: timestamp("maturity_date", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "loans_organization_id_organizations_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.borrowerId],
			foreignColumns: [borrowers.id],
			name: "loans_borrower_id_borrowers_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.lenderId],
			foreignColumns: [lenders.id],
			name: "loans_lender_id_lenders_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.propertyId],
			foreignColumns: [properties.id],
			name: "loans_property_id_properties_id_fk"
		}).onDelete("set null"),
]);

export const loanDocuments = pgTable("loan_documents", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	loanId: uuid("loan_id").notNull(),
	documentType: loanDocumentType("document_type").notNull(),
	fileName: text("file_name").notNull(),
	fileUrl: text("file_url").notNull(),
	fileSize: text("file_size"),
	uploadedBy: text("uploaded_by"),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.loanId],
			foreignColumns: [loans.id],
			name: "loan_documents_loan_id_loans_id_fk"
		}).onDelete("cascade"),
]);

export const paymentSchedules = pgTable("payment_schedules", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	loanId: uuid("loan_id").notNull(),
	scheduleType: scheduleTypeEnum("schedule_type").notNull(),
	paymentFrequency: paymentFrequency("payment_frequency").notNull(),
	totalPayments: numeric("total_payments").notNull(),
	paymentAmount: numeric("payment_amount", { precision: 14, scale:  2 }).notNull(),
	scheduleData: text("schedule_data").notNull(),
	isActive: numeric("is_active").default('1'),
	generatedAt: timestamp("generated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	generatedBy: text("generated_by"),
}, (table) => [
	index("payment_schedules_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("numeric_ops")),
	index("payment_schedules_loan_id_idx").using("btree", table.loanId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.loanId],
			foreignColumns: [loans.id],
			name: "payment_schedules_loan_id_loans_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.generatedBy],
			foreignColumns: [userLegacy.id],
			name: "payment_schedules_generated_by_user_id_fk"
		}),
]);

export const payments = pgTable("payments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	loanId: uuid("loan_id").notNull(),
	paymentType: text("payment_type").notNull(),
	amount: numeric({ precision: 14, scale:  2 }).notNull(),
	principalAmount: numeric("principal_amount", { precision: 14, scale:  2 }).default('0'),
	interestAmount: numeric("interest_amount", { precision: 14, scale:  2 }).default('0'),
	feeAmount: numeric("fee_amount", { precision: 14, scale:  2 }).default('0'),
	paymentMethod: paymentMethodEnum("payment_method").notNull(),
	status: paymentStatusEnum().default('pending'),
	transactionReference: text("transaction_reference"),
	bankReference: text("bank_reference"),
	checkNumber: text("check_number"),
	paymentDate: date("payment_date").notNull(),
	receivedDate: date("received_date"),
	processedDate: timestamp("processed_date", { withTimezone: true, mode: 'string' }),
	notes: text(),
	createdBy: text("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("payments_loan_id_idx").using("btree", table.loanId.asc().nullsLast().op("uuid_ops")),
	index("payments_payment_date_idx").using("btree", table.paymentDate.asc().nullsLast().op("date_ops")),
	index("payments_payment_method_idx").using("btree", table.paymentMethod.asc().nullsLast().op("enum_ops")),
	index("payments_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.loanId],
			foreignColumns: [loans.id],
			name: "payments_loan_id_loans_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [appUsers.id],
			name: "payments_created_by_fkey"
		}).onDelete("set null"),
]);

export const drawSchedules = pgTable("draw_schedules", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	loanId: uuid("loan_id").notNull(),
	totalDraws: integer("total_draws").notNull(),
	totalBudget: numeric("total_budget", { precision: 14, scale:  2 }).notNull(),
	scheduleData: text("schedule_data").notNull(),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdBy: text("created_by"),
}, (table) => [
	index("draw_schedules_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("draw_schedules_loan_id_idx").using("btree", table.loanId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.loanId],
			foreignColumns: [loans.id],
			name: "draw_schedules_loan_id_loans_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [userLegacy.id],
			name: "draw_schedules_created_by_user_id_fk"
		}),
]);

export const draws = pgTable("draws", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	loanId: uuid("loan_id").notNull(),
	drawNumber: integer("draw_number").notNull(),
	amountRequested: numeric("amount_requested", { precision: 14, scale:  2 }).notNull(),
	amountApproved: numeric("amount_approved", { precision: 14, scale:  2 }),
	amountDisbursed: numeric("amount_disbursed", { precision: 14, scale:  2 }),
	workDescription: text("work_description").notNull(),
	budgetLineItem: text("budget_line_item"),
	contractorName: text("contractor_name"),
	contractorContact: text("contractor_contact"),
	status: drawStatusEnum().default('requested'),
	requestedBy: text("requested_by"),
	approvedBy: text("approved_by"),
	inspectedBy: text("inspected_by"),
	requestedDate: date("requested_date").defaultNow(),
	approvedDate: date("approved_date"),
	inspectionDate: date("inspection_date"),
	disbursedDate: date("disbursed_date"),
	notes: text(),
	rejectionReason: text("rejection_reason"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("draws_loan_id_idx").using("btree", table.loanId.asc().nullsLast().op("uuid_ops")),
	index("draws_requested_date_idx").using("btree", table.requestedDate.asc().nullsLast().op("date_ops")),
	index("draws_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.loanId],
			foreignColumns: [loans.id],
			name: "draws_loan_id_loans_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.requestedBy],
			foreignColumns: [userLegacy.id],
			name: "draws_requested_by_user_id_fk"
		}),
	foreignKey({
			columns: [table.approvedBy],
			foreignColumns: [userLegacy.id],
			name: "draws_approved_by_user_id_fk"
		}),
	foreignKey({
			columns: [table.inspectedBy],
			foreignColumns: [userLegacy.id],
			name: "draws_inspected_by_user_id_fk"
		}),
	unique("draws_loan_id_draw_number_unique").on(table.loanId, table.drawNumber),
]);

export const loanNotes = pgTable("loan_notes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	loanId: uuid("loan_id").notNull(),
	content: text().notNull(),
	createdBy: text("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.loanId],
			foreignColumns: [loans.id],
			name: "loan_notes_loan_id_loans_id_fk"
		}).onDelete("cascade"),
]);

export const eventHandlers = pgTable("event_handlers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	handlerName: text("handler_name").notNull(),
	eventType: text("event_type").notNull(),
	isEnabled: integer("is_enabled").default(1).notNull(),
	priority: integer().default(100).notNull(),
	lastExecutedAt: timestamp("last_executed_at", { withTimezone: true, mode: 'string' }),
	successCount: integer("success_count").default(0).notNull(),
	failureCount: integer("failure_count").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("event_handlers_event_type_idx").using("btree", table.eventType.asc().nullsLast().op("text_ops")),
	unique("event_handlers_handler_name_unique").on(table.handlerName),
]);

export const eventIngest = pgTable("event_ingest", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	eventId: uuid("event_id").notNull(),
	eventType: text("event_type").notNull(),
	domain: text(),
	aggregateId: uuid("aggregate_id"),
	payload: jsonb().notNull(),
	occurredAt: timestamp("occurred_at", { withTimezone: true, mode: 'string' }).notNull(),
	ingestedAt: timestamp("ingested_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("event_ingest_event_type_idx").using("btree", table.eventType.asc().nullsLast().op("text_ops")),
	index("event_ingest_occurred_at_idx").using("btree", table.occurredAt.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [domainEvents.id],
			name: "event_ingest_event_id_domain_events_id_fk"
		}).onDelete("cascade"),
]);

export const fundSnapshots = pgTable("fund_snapshots", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	snapshotDate: date("snapshot_date").notNull(),
	totalCommitments: numeric("total_commitments", { precision: 15, scale:  2 }).default('0').notNull(),
	capitalDeployed: numeric("capital_deployed", { precision: 15, scale:  2 }).default('0').notNull(),
	avgInvestorYield: numeric("avg_investor_yield", { precision: 6, scale:  3 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("fund_snapshots_snapshot_date_idx").using("btree", table.snapshotDate.asc().nullsLast().op("date_ops")),
	unique("fund_snapshots_snapshot_date_unique").on(table.snapshotDate),
]);

export const inspectionSnapshots = pgTable("inspection_snapshots", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	snapshotDate: date("snapshot_date").notNull(),
	scheduledCount: integer("scheduled_count").default(0).notNull(),
	completedCount: integer("completed_count").default(0).notNull(),
	avgCompletionHours: numeric("avg_completion_hours", { precision: 6, scale:  2 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("inspection_snapshots_snapshot_date_idx").using("btree", table.snapshotDate.asc().nullsLast().op("date_ops")),
	unique("inspection_snapshots_snapshot_date_unique").on(table.snapshotDate),
]);

export const loanSnapshots = pgTable("loan_snapshots", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	snapshotDate: date("snapshot_date").notNull(),
	activeCount: integer("active_count").default(0).notNull(),
	delinquentCount: integer("delinquent_count").default(0).notNull(),
	avgLtv: numeric("avg_ltv", { precision: 6, scale:  3 }),
	totalPrincipal: numeric("total_principal", { precision: 15, scale:  2 }).default('0').notNull(),
	interestAccrued: numeric("interest_accrued", { precision: 14, scale:  2 }).default('0').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("loan_snapshots_snapshot_date_idx").using("btree", table.snapshotDate.asc().nullsLast().op("date_ops")),
	unique("loan_snapshots_snapshot_date_unique").on(table.snapshotDate),
]);

export const paymentSnapshots = pgTable("payment_snapshots", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	snapshotDate: date("snapshot_date").notNull(),
	amountReceived: numeric("amount_received", { precision: 15, scale:  2 }).default('0').notNull(),
	amountScheduled: numeric("amount_scheduled", { precision: 15, scale:  2 }).default('0').notNull(),
	lateCount: integer("late_count").default(0).notNull(),
	avgCollectionDays: numeric("avg_collection_days", { precision: 6, scale:  2 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("payment_snapshots_snapshot_date_idx").using("btree", table.snapshotDate.asc().nullsLast().op("date_ops")),
	unique("payment_snapshots_snapshot_date_unique").on(table.snapshotDate),
]);

export const domainEvents = pgTable("domain_events", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	eventType: text("event_type").notNull(),
	eventVersion: text("event_version").default('1.0').notNull(),
	aggregateId: uuid("aggregate_id").notNull(),
	aggregateType: text("aggregate_type").notNull(),
	payload: jsonb().notNull(),
	metadata: jsonb(),
	sequenceNumber: integer("sequence_number").notNull(),
	causationId: uuid("causation_id"),
	correlationId: uuid("correlation_id"),
	occurredAt: timestamp("occurred_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	processedAt: timestamp("processed_at", { withTimezone: true, mode: 'string' }),
	processingStatus: text("processing_status").default('pending').notNull(),
	processingError: text("processing_error"),
	retryCount: integer("retry_count").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("domain_events_aggregate_idx").using("btree", table.aggregateId.asc().nullsLast().op("text_ops"), table.aggregateType.asc().nullsLast().op("uuid_ops")),
	index("domain_events_event_type_idx").using("btree", table.eventType.asc().nullsLast().op("text_ops")),
	index("domain_events_occurred_at_idx").using("btree", table.occurredAt.asc().nullsLast().op("timestamptz_ops")),
	index("domain_events_processing_status_idx").using("btree", table.processingStatus.asc().nullsLast().op("text_ops")),
]);

export const alerts = pgTable("alerts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	entityType: varchar("entity_type", { length: 50 }).notNull(),
	entityId: uuid("entity_id").notNull(),
	code: varchar({ length: 100 }).notNull(),
	severity: alertSeverity().default('info').notNull(),
	status: alertStatus().default('unread').notNull(),
	message: text().notNull(),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	readAt: timestamp("read_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const fundCommitments = pgTable("fund_commitments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	fundId: uuid("fund_id").notNull(),
	lenderId: uuid("lender_id").notNull(),
	committedAmount: numeric("committed_amount", { precision: 15, scale:  2 }).notNull(),
	calledAmount: numeric("called_amount", { precision: 15, scale:  2 }).default('0').notNull(),
	returnedAmount: numeric("returned_amount", { precision: 15, scale:  2 }).default('0').notNull(),
	status: commitmentStatus().default('pending').notNull(),
	commitmentDate: timestamp("commitment_date", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("fund_commitments_fund_id_idx").using("btree", table.fundId.asc().nullsLast().op("uuid_ops")),
	index("fund_commitments_fund_status_idx").using("btree", table.fundId.asc().nullsLast().op("enum_ops"), table.status.asc().nullsLast().op("enum_ops")),
	index("fund_commitments_lender_id_idx").using("btree", table.lenderId.asc().nullsLast().op("uuid_ops")),
	index("fund_commitments_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.fundId],
			foreignColumns: [funds.id],
			name: "fund_commitments_fund_id_funds_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.lenderId],
			foreignColumns: [lenders.id],
			name: "fund_commitments_lender_id_lenders_id_fk"
		}).onDelete("cascade"),
]);

export const fundLoanAllocations = pgTable("fund_loan_allocations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	fundId: uuid("fund_id").notNull(),
	loanId: uuid("loan_id").notNull(),
	allocatedAmount: numeric("allocated_amount", { precision: 15, scale:  2 }).notNull(),
	returnedAmount: numeric("returned_amount", { precision: 15, scale:  2 }).default('0').notNull(),
	allocationDate: timestamp("allocation_date", { withTimezone: true, mode: 'string' }).notNull(),
	fullReturnDate: timestamp("full_return_date", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("fund_loan_allocations_fund_id_idx").using("btree", table.fundId.asc().nullsLast().op("uuid_ops")),
	index("fund_loan_allocations_fund_loan_idx").using("btree", table.fundId.asc().nullsLast().op("uuid_ops"), table.loanId.asc().nullsLast().op("uuid_ops")),
	index("fund_loan_allocations_loan_id_idx").using("btree", table.loanId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.fundId],
			foreignColumns: [funds.id],
			name: "fund_loan_allocations_fund_id_funds_id_fk"
		}).onDelete("cascade"),
]);

export const fundCalls = pgTable("fund_calls", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	fundId: uuid("fund_id").notNull(),
	callNumber: integer("call_number").notNull(),
	callAmount: numeric("call_amount", { precision: 15, scale:  2 }).notNull(),
	dueDate: timestamp("due_date", { withTimezone: true, mode: 'string' }).notNull(),
	status: capitalCallStatus().default('pending').notNull(),
	purpose: text(),
	notes: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("fund_calls_due_date_idx").using("btree", table.dueDate.asc().nullsLast().op("timestamptz_ops")),
	index("fund_calls_fund_id_idx").using("btree", table.fundId.asc().nullsLast().op("uuid_ops")),
	index("fund_calls_fund_status_idx").using("btree", table.fundId.asc().nullsLast().op("enum_ops"), table.status.asc().nullsLast().op("enum_ops")),
	index("fund_calls_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.fundId],
			foreignColumns: [funds.id],
			name: "fund_calls_fund_id_funds_id_fk"
		}).onDelete("cascade"),
]);

export const fundDistributions = pgTable("fund_distributions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	fundId: uuid("fund_id").notNull(),
	distributionDate: timestamp("distribution_date", { withTimezone: true, mode: 'string' }).notNull(),
	totalAmount: numeric("total_amount", { precision: 15, scale:  2 }).notNull(),
	distributionType: distributionType("distribution_type").notNull(),
	status: distributionStatus().default('scheduled').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("fund_distributions_date_idx").using("btree", table.distributionDate.asc().nullsLast().op("timestamptz_ops")),
	index("fund_distributions_fund_id_idx").using("btree", table.fundId.asc().nullsLast().op("uuid_ops")),
	index("fund_distributions_fund_type_idx").using("btree", table.fundId.asc().nullsLast().op("uuid_ops"), table.distributionType.asc().nullsLast().op("uuid_ops")),
	index("fund_distributions_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.fundId],
			foreignColumns: [funds.id],
			name: "fund_distributions_fund_id_funds_id_fk"
		}).onDelete("cascade"),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
});

export const borrowerDocuments = pgTable("borrower_documents", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	borrowerId: uuid("borrower_id").notNull(),
	documentType: documentType("document_type").notNull(),
	fileUrl: text("file_url").notNull(),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.borrowerId],
			foreignColumns: [borrowers.id],
			name: "borrower_documents_borrower_id_borrowers_id_fk"
		}).onDelete("cascade"),
]);

export const inspections = pgTable("inspections", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	drawId: uuid("draw_id").notNull(),
	inspectionType: inspectionTypeEnum("inspection_type").notNull(),
	status: inspectionStatusEnum().default('scheduled'),
	inspectorName: text("inspector_name").notNull(),
	inspectorContact: text("inspector_contact"),
	inspectionLocation: text("inspection_location"),
	workCompletionPercentage: integer("work_completion_percentage"),
	qualityRating: integer("quality_rating"),
	safetyCompliant: boolean("safety_compliant").default(true),
	findings: text(),
	recommendations: text(),
	photos: text(),
	signatures: text(),
	scheduledDate: date("scheduled_date"),
	completedDate: date("completed_date"),
	inspectionDurationMinutes: integer("inspection_duration_minutes"),
	weatherConditions: text("weather_conditions"),
	equipmentUsed: text("equipment_used"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("inspections_completed_date_idx").using("btree", table.completedDate.asc().nullsLast().op("date_ops")),
	index("inspections_draw_id_idx").using("btree", table.drawId.asc().nullsLast().op("uuid_ops")),
	index("inspections_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.drawId],
			foreignColumns: [draws.id],
			name: "inspections_draw_id_draws_id_fk"
		}).onDelete("cascade"),
]);

export const eventProcessingLog = pgTable("event_processing_log", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	eventId: uuid("event_id").notNull(),
	handlerId: uuid("handler_id").notNull(),
	status: text().notNull(),
	executionTimeMs: integer("execution_time_ms"),
	error: text(),
	executedAt: timestamp("executed_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("event_processing_log_event_id_idx").using("btree", table.eventId.asc().nullsLast().op("uuid_ops")),
	index("event_processing_log_executed_at_idx").using("btree", table.executedAt.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [domainEvents.id],
			name: "event_processing_log_event_id_domain_events_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.handlerId],
			foreignColumns: [eventHandlers.id],
			name: "event_processing_log_handler_id_event_handlers_id_fk"
		}).onDelete("cascade"),
]);

export const funds = pgTable("funds", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	name: text().notNull(),
	fundType: fundType("fund_type").notNull(),
	status: fundStatus().default('active').notNull(),
	totalCapacity: numeric("total_capacity", { precision: 15, scale:  2 }).notNull(),
	totalCommitted: numeric("total_committed", { precision: 15, scale:  2 }).default('0').notNull(),
	totalDeployed: numeric("total_deployed", { precision: 15, scale:  2 }).default('0').notNull(),
	totalReturned: numeric("total_returned", { precision: 15, scale:  2 }).default('0').notNull(),
	inceptionDate: timestamp("inception_date", { withTimezone: true, mode: 'string' }).notNull(),
	closingDate: timestamp("closing_date", { withTimezone: true, mode: 'string' }),
	liquidationDate: timestamp("liquidation_date", { withTimezone: true, mode: 'string' }),
	strategy: text(),
	targetReturn: numeric("target_return", { precision: 5, scale:  2 }),
	managementFeeBps: integer("management_fee_bps").default(0).notNull(),
	performanceFeeBps: integer("performance_fee_bps").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("funds_fund_type_idx").using("btree", table.fundType.asc().nullsLast().op("enum_ops")),
	index("funds_organization_id_idx").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("funds_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "funds_organization_id_organizations_id_fk"
		}).onDelete("cascade"),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [userLegacy.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const userLegacy = pgTable("user_legacy", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const userPortalAccess = pgTable("user_portal_access", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	organizationId: text("organization_id").notNull(),
	portalType: portalType("portal_type").notNull(),
	role: text().default('member').notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [appUsers.id],
			name: "user_portal_access_user_id_fkey"
		}).onDelete("cascade"),
]);

export const member = pgTable("member", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	organizationId: text("organization_id").notNull(),
	role: text().default('member').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [userLegacy.id],
			name: "member_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "member_organization_id_fkey"
		}).onDelete("cascade"),
	unique("member_user_id_organization_id_key").on(table.userId, table.organizationId),
]);

export const organization = pgTable("organization", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	slug: text(),
	logo: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("organization_slug_key").on(table.slug),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [userLegacy.id],
			name: "session_user_id_fkey"
		}).onDelete("cascade"),
	unique("session_token_key").on(table.token),
]);

export const userIdMapping = pgTable("user_id_mapping", {
	legacyId: text("legacy_id").primaryKey().notNull(),
	clerkId: text("clerk_id").notNull(),
	email: text().notNull(),
	migratedAt: timestamp("migrated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_user_mapping_clerk").using("btree", table.clerkId.asc().nullsLast().op("text_ops")),
	index("idx_user_mapping_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	unique("user_id_mapping_clerk_id_key").on(table.clerkId),
]);

export const appUsers = pgTable("app_users", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	name: text().notNull(),
	firstName: text("first_name"),
	lastName: text("last_name"),
	imageUrl: text("image_url"),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_app_users_active").using("btree", table.isActive.asc().nullsLast().op("bool_ops")).where(sql`(is_active = true)`),
	index("idx_app_users_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	unique("app_users_email_key").on(table.email),
]);

export const userRoles = pgTable("user_roles", {
	userId: text("user_id").notNull(),
	roleId: uuid("role_id").notNull(),
	assignedAt: timestamp("assigned_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [userLegacy.id],
			name: "user_roles_user_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.id],
			name: "user_roles_role_id_roles_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.userId, table.roleId], name: "user_roles_user_id_role_id_pk"}),
]);

export const userOrganizations = pgTable("user_organizations", {
	userId: text("user_id").notNull(),
	organizationId: uuid("organization_id").notNull(),
	role: text().default('member').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "user_organizations_organization_id_organizations_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [appUsers.id],
			name: "user_organizations_user_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.userId, table.organizationId], name: "user_organizations_user_id_organization_id_pk"}),
]);

export const borrowerLoans = pgTable("borrower_loans", {
	borrowerId: uuid("borrower_id").notNull(),
	loanId: uuid("loan_id").notNull(),
	role: text().default('primary').notNull(),
	isPrimary: boolean("is_primary").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("borrower_loans_is_primary_idx").using("btree", table.isPrimary.asc().nullsLast().op("bool_ops")),
	index("borrower_loans_loan_id_idx").using("btree", table.loanId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.borrowerId],
			foreignColumns: [borrowers.id],
			name: "borrower_loans_borrower_id_borrowers_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.loanId],
			foreignColumns: [loans.id],
			name: "borrower_loans_loan_id_loans_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.borrowerId, table.loanId], name: "borrower_loans_borrower_id_loan_id_pk"}),
]);

export const lenderLoans = pgTable("lender_loans", {
	lenderId: uuid("lender_id").notNull(),
	loanId: uuid("loan_id").notNull(),
	role: text().default('primary').notNull(),
	isPrimary: boolean("is_primary").default(false).notNull(),
	percentage: numeric({ precision: 5, scale:  2 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("lender_loans_is_primary_idx").using("btree", table.isPrimary.asc().nullsLast().op("bool_ops")),
	index("lender_loans_loan_id_idx").using("btree", table.loanId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.lenderId],
			foreignColumns: [lenders.id],
			name: "lender_loans_lender_id_lenders_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.loanId],
			foreignColumns: [loans.id],
			name: "lender_loans_loan_id_loans_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.lenderId, table.loanId], name: "lender_loans_lender_id_loan_id_pk"}),
]);
