import { relations } from "drizzle-orm/relations";
import { organizations, borrowers, lenders, properties, propertyPhotos, loans, collateral, loanTerms, loanDocuments, paymentSchedules, userLegacy, payments, appUsers, drawSchedules, draws, loanNotes, domainEvents, eventIngest, funds, fundCommitments, fundLoanAllocations, fundCalls, fundDistributions, borrowerDocuments, inspections, eventProcessingLog, eventHandlers, account, userPortalAccess, member, organization, session, userRoles, roles, userOrganizations, borrowerLoans, lenderLoans } from "./schema";

export const borrowersRelations = relations(borrowers, ({one, many}) => ({
	organization: one(organizations, {
		fields: [borrowers.organizationId],
		references: [organizations.id]
	}),
	loans: many(loans),
	borrowerDocuments: many(borrowerDocuments),
	borrowerLoans: many(borrowerLoans),
}));

export const organizationsRelations = relations(organizations, ({many}) => ({
	borrowers: many(borrowers),
	lenders: many(lenders),
	properties: many(properties),
	loans: many(loans),
	funds: many(funds),
	userOrganizations: many(userOrganizations),
}));

export const lendersRelations = relations(lenders, ({one, many}) => ({
	organization: one(organizations, {
		fields: [lenders.organizationId],
		references: [organizations.id]
	}),
	loans: many(loans),
	fundCommitments: many(fundCommitments),
	lenderLoans: many(lenderLoans),
}));

export const propertiesRelations = relations(properties, ({one, many}) => ({
	organization: one(organizations, {
		fields: [properties.organizationId],
		references: [organizations.id]
	}),
	propertyPhotos: many(propertyPhotos),
	loans: many(loans),
}));

export const propertyPhotosRelations = relations(propertyPhotos, ({one}) => ({
	property: one(properties, {
		fields: [propertyPhotos.propertyId],
		references: [properties.id]
	}),
}));

export const collateralRelations = relations(collateral, ({one}) => ({
	loan: one(loans, {
		fields: [collateral.loanId],
		references: [loans.id]
	}),
}));

export const loansRelations = relations(loans, ({one, many}) => ({
	collaterals: many(collateral),
	loanTerms: many(loanTerms),
	organization: one(organizations, {
		fields: [loans.organizationId],
		references: [organizations.id]
	}),
	borrower: one(borrowers, {
		fields: [loans.borrowerId],
		references: [borrowers.id]
	}),
	lender: one(lenders, {
		fields: [loans.lenderId],
		references: [lenders.id]
	}),
	property: one(properties, {
		fields: [loans.propertyId],
		references: [properties.id]
	}),
	loanDocuments: many(loanDocuments),
	paymentSchedules: many(paymentSchedules),
	payments: many(payments),
	drawSchedules: many(drawSchedules),
	draws: many(draws),
	loanNotes: many(loanNotes),
	borrowerLoans: many(borrowerLoans),
	lenderLoans: many(lenderLoans),
}));

export const loanTermsRelations = relations(loanTerms, ({one}) => ({
	loan: one(loans, {
		fields: [loanTerms.loanId],
		references: [loans.id]
	}),
}));

export const loanDocumentsRelations = relations(loanDocuments, ({one}) => ({
	loan: one(loans, {
		fields: [loanDocuments.loanId],
		references: [loans.id]
	}),
}));

export const paymentSchedulesRelations = relations(paymentSchedules, ({one}) => ({
	loan: one(loans, {
		fields: [paymentSchedules.loanId],
		references: [loans.id]
	}),
	userLegacy: one(userLegacy, {
		fields: [paymentSchedules.generatedBy],
		references: [userLegacy.id]
	}),
}));

export const userLegacyRelations = relations(userLegacy, ({many}) => ({
	paymentSchedules: many(paymentSchedules),
	drawSchedules: many(drawSchedules),
	draws_requestedBy: many(draws, {
		relationName: "draws_requestedBy_userLegacy_id"
	}),
	draws_approvedBy: many(draws, {
		relationName: "draws_approvedBy_userLegacy_id"
	}),
	draws_inspectedBy: many(draws, {
		relationName: "draws_inspectedBy_userLegacy_id"
	}),
	accounts: many(account),
	members: many(member),
	sessions: many(session),
	userRoles: many(userRoles),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	loan: one(loans, {
		fields: [payments.loanId],
		references: [loans.id]
	}),
	appUser: one(appUsers, {
		fields: [payments.createdBy],
		references: [appUsers.id]
	}),
}));

export const appUsersRelations = relations(appUsers, ({many}) => ({
	payments: many(payments),
	userPortalAccesses: many(userPortalAccess),
	userOrganizations: many(userOrganizations),
}));

export const drawSchedulesRelations = relations(drawSchedules, ({one}) => ({
	loan: one(loans, {
		fields: [drawSchedules.loanId],
		references: [loans.id]
	}),
	userLegacy: one(userLegacy, {
		fields: [drawSchedules.createdBy],
		references: [userLegacy.id]
	}),
}));

export const drawsRelations = relations(draws, ({one, many}) => ({
	loan: one(loans, {
		fields: [draws.loanId],
		references: [loans.id]
	}),
	userLegacy_requestedBy: one(userLegacy, {
		fields: [draws.requestedBy],
		references: [userLegacy.id],
		relationName: "draws_requestedBy_userLegacy_id"
	}),
	userLegacy_approvedBy: one(userLegacy, {
		fields: [draws.approvedBy],
		references: [userLegacy.id],
		relationName: "draws_approvedBy_userLegacy_id"
	}),
	userLegacy_inspectedBy: one(userLegacy, {
		fields: [draws.inspectedBy],
		references: [userLegacy.id],
		relationName: "draws_inspectedBy_userLegacy_id"
	}),
	inspections: many(inspections),
}));

export const loanNotesRelations = relations(loanNotes, ({one}) => ({
	loan: one(loans, {
		fields: [loanNotes.loanId],
		references: [loans.id]
	}),
}));

export const eventIngestRelations = relations(eventIngest, ({one}) => ({
	domainEvent: one(domainEvents, {
		fields: [eventIngest.eventId],
		references: [domainEvents.id]
	}),
}));

export const domainEventsRelations = relations(domainEvents, ({many}) => ({
	eventIngests: many(eventIngest),
	eventProcessingLogs: many(eventProcessingLog),
}));

export const fundCommitmentsRelations = relations(fundCommitments, ({one}) => ({
	fund: one(funds, {
		fields: [fundCommitments.fundId],
		references: [funds.id]
	}),
	lender: one(lenders, {
		fields: [fundCommitments.lenderId],
		references: [lenders.id]
	}),
}));

export const fundsRelations = relations(funds, ({one, many}) => ({
	fundCommitments: many(fundCommitments),
	fundLoanAllocations: many(fundLoanAllocations),
	fundCalls: many(fundCalls),
	fundDistributions: many(fundDistributions),
	organization: one(organizations, {
		fields: [funds.organizationId],
		references: [organizations.id]
	}),
}));

export const fundLoanAllocationsRelations = relations(fundLoanAllocations, ({one}) => ({
	fund: one(funds, {
		fields: [fundLoanAllocations.fundId],
		references: [funds.id]
	}),
}));

export const fundCallsRelations = relations(fundCalls, ({one}) => ({
	fund: one(funds, {
		fields: [fundCalls.fundId],
		references: [funds.id]
	}),
}));

export const fundDistributionsRelations = relations(fundDistributions, ({one}) => ({
	fund: one(funds, {
		fields: [fundDistributions.fundId],
		references: [funds.id]
	}),
}));

export const borrowerDocumentsRelations = relations(borrowerDocuments, ({one}) => ({
	borrower: one(borrowers, {
		fields: [borrowerDocuments.borrowerId],
		references: [borrowers.id]
	}),
}));

export const inspectionsRelations = relations(inspections, ({one}) => ({
	draw: one(draws, {
		fields: [inspections.drawId],
		references: [draws.id]
	}),
}));

export const eventProcessingLogRelations = relations(eventProcessingLog, ({one}) => ({
	domainEvent: one(domainEvents, {
		fields: [eventProcessingLog.eventId],
		references: [domainEvents.id]
	}),
	eventHandler: one(eventHandlers, {
		fields: [eventProcessingLog.handlerId],
		references: [eventHandlers.id]
	}),
}));

export const eventHandlersRelations = relations(eventHandlers, ({many}) => ({
	eventProcessingLogs: many(eventProcessingLog),
}));

export const accountRelations = relations(account, ({one}) => ({
	userLegacy: one(userLegacy, {
		fields: [account.userId],
		references: [userLegacy.id]
	}),
}));

export const userPortalAccessRelations = relations(userPortalAccess, ({one}) => ({
	appUser: one(appUsers, {
		fields: [userPortalAccess.userId],
		references: [appUsers.id]
	}),
}));

export const memberRelations = relations(member, ({one}) => ({
	userLegacy: one(userLegacy, {
		fields: [member.userId],
		references: [userLegacy.id]
	}),
	organization: one(organization, {
		fields: [member.organizationId],
		references: [organization.id]
	}),
}));

export const organizationRelations = relations(organization, ({many}) => ({
	members: many(member),
}));

export const sessionRelations = relations(session, ({one}) => ({
	userLegacy: one(userLegacy, {
		fields: [session.userId],
		references: [userLegacy.id]
	}),
}));

export const userRolesRelations = relations(userRoles, ({one}) => ({
	userLegacy: one(userLegacy, {
		fields: [userRoles.userId],
		references: [userLegacy.id]
	}),
	role: one(roles, {
		fields: [userRoles.roleId],
		references: [roles.id]
	}),
}));

export const rolesRelations = relations(roles, ({many}) => ({
	userRoles: many(userRoles),
}));

export const userOrganizationsRelations = relations(userOrganizations, ({one}) => ({
	organization: one(organizations, {
		fields: [userOrganizations.organizationId],
		references: [organizations.id]
	}),
	appUser: one(appUsers, {
		fields: [userOrganizations.userId],
		references: [appUsers.id]
	}),
}));

export const borrowerLoansRelations = relations(borrowerLoans, ({one}) => ({
	borrower: one(borrowers, {
		fields: [borrowerLoans.borrowerId],
		references: [borrowers.id]
	}),
	loan: one(loans, {
		fields: [borrowerLoans.loanId],
		references: [loans.id]
	}),
}));

export const lenderLoansRelations = relations(lenderLoans, ({one}) => ({
	lender: one(lenders, {
		fields: [lenderLoans.lenderId],
		references: [lenders.id]
	}),
	loan: one(loans, {
		fields: [lenderLoans.loanId],
		references: [loans.id]
	}),
}));