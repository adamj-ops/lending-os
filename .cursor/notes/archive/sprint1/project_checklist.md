# Project Checklist - Lending OS

## Project Overview
Starting with the Next.js Shadcn Admin Dashboard template as the foundation for a lending operating system.

## Current Status
- [x] Clone Next.js Shadcn Admin Dashboard template
- [x] Install dependencies
- [x] Set up .cursor folder structure
- [x] Test the development server (running on localhost:3000)
- [x] Review template features and structure
- [x] Plan lending-specific customizations
- [x] Complete Sprint 1 Foundation Setup

## Next Steps
1. Start development server to verify installation
2. Explore the template's dashboard layouts and components
3. Identify areas for lending-specific customization
4. Plan the lending workflow and user journeys
5. Design the data models for lending operations

## Template Features Available
- Multiple dashboard layouts (Default, CRM, Finance)
- Authentication flows
- Theme customization (light/dark modes with color schemes)
- Responsive design
- Shadcn UI components
- TypeScript support
- Modern Next.js 16 with App Router

## Sprint 1 - Foundation Setup ✅
- [x] Install dependencies (Drizzle, Better Auth, fonts)
- [x] Create Drizzle configuration and MVP schema
- [x] Set up BetterAuth with email/password
- [x] Update login/register forms
- [x] Create auth middleware
- [x] Update branding to Lending OS
- [x] Configure Open Sans + Geist Mono fonts
- [x] Adapt Finance dashboard to Portfolio dashboard
- [x] Create loan service layer and API routes
- [x] Update sidebar navigation
- [x] Create seed script with sample data
- [x] Document architecture and APIs

## Sprint 2A - Database & CRUD (✅ Complete)
- [x] Create borrowers and borrower_documents tables
- [x] Create lenders table
- [x] Create properties and property_photos tables
- [x] Create roles and user_roles tables (RBAC schema)
- [x] Update loans schema with extended status enum
- [x] Generate and run migrations
- [x] Create borrower service layer
- [x] Create lender service layer
- [x] Create property service layer
- [x] Update loan service with state transitions
- [x] Create borrowers API routes
- [x] Create lenders API routes
- [x] Create properties API routes
- [x] Create loan status transition API
- [x] Create TypeScript types for all entities
- [x] Build loans list page with data table
- [x] Build borrowers list page with data table
- [x] Build lenders list page with data table
- [x] Build properties list page with grid view
- [x] Update sidebar navigation
- [x] Update seed script with all entities

## Sprint 2B - Loan Details & Wizard v1 (✅ Complete)
- [x] Create loan_documents and loan_notes schemas
- [x] Install AWS SDK and Zustand
- [x] Create S3 upload infrastructure
- [x] Create file upload component
- [x] Build loan detail drawer with 7 tabs
  - [x] Overview tab
  - [x] Property tab  
  - [x] Borrower tab
  - [x] Lender tab
  - [x] Documents tab (with S3 upload)
  - [x] Notes tab
  - [x] Progress tab (with payment calculations)
- [x] Create 7-step loan wizard v1
  - [x] Loan Type step
  - [x] Borrower step (search/create)
  - [x] Property step (search/create)
  - [x] Lender step (search/create)
  - [x] Loan Terms step
  - [x] Documents step (with S3 upload)
  - [x] Review step
- [x] Create wizard API endpoint for atomic loan creation
- [x] Integrate drawer and wizard into loans page
- [x] Document and notes API routes
- [x] Fix TypeScript build errors (final cleanup)
- [x] Fix delete method rowCount pattern in all services
- [x] Remove circular dependency between loans and properties schemas
- [x] Fix Next.js 16 async params pattern across all API routes
- [x] Build passes successfully ✅

## Sprint 2C - Loan Builder v2 Transformation (✅ Complete)
- [x] Create comprehensive v2 specification document
- [x] Database schema enhancements
  - [x] Add loan_category enum (asset_backed, yield_note, hybrid)
  - [x] Add payment_type and payment_frequency enums
  - [x] Add fee fields in basis points (origination, late, default)
  - [x] Create loan_terms table (amortization, compounding, notes)
  - [x] Create collateral table (lien position, draw schedule JSONB)
  - [x] Update borrowers (type, name, taxIdEncrypted)
  - [x] Update lenders (contactPhone, IRA entity type)
  - [x] Update properties (organizationId, occupancy, estimatedValue, rehabBudget, photos)
  - [x] Generate migration SQL (0004_loan_builder_v2.sql)
- [x] Type system updates
  - [x] Update loan.ts with LoanCategory, PaymentType, PaymentFrequency enums
  - [x] Update borrower.ts with type field
  - [x] Update lender.ts with contactPhone and IRA
  - [x] Update property.ts with v2 fields
  - [x] Create comprehensive loan-builder types
  - [x] Create collateral and forecast types
- [x] Zod validation schemas
  - [x] Create discriminated union schemas
  - [x] Category-specific validation (AssetBacked, YieldNote, Hybrid)
  - [x] Step-based validation schemas
  - [x] Complete CreateLoanSchema with refinements
- [x] Zustand store with persistence
  - [x] Create useLoanBuilder store
  - [x] Add localStorage persistence
  - [x] Draft save/resume functionality
- [x] New wizard steps (React Hook Form)
  - [x] StepCategory - 3-card selector
  - [x] StepParty - Conditional borrower/lender (368 lines)
  - [x] StepAsset - Conditional property/investment
  - [x] StepCollateral - Lien position, draw schedule
  - [x] StepForecast - AI risk assessment
- [x] Refactored existing steps
  - [x] LoanTermsStep - Added payment type/frequency, fees (BPS), escrow
  - [x] ReviewStep - Category-specific summaries
- [x] Main wizard refactor
  - [x] Wrap in FormProvider with Zod resolver
  - [x] Integrate Step 0 (category selection)
  - [x] Conditional step rendering based on loanCategory
  - [x] Draft save/resume with localStorage
  - [x] Update to call /api/v1/loans/v2
- [x] API endpoints
  - [x] POST /api/v1/loans/v2 - v2 loan creation
  - [x] POST /api/v1/analytics/forecast - AI forecast stub
  - [x] POST /api/v1/uploads/sign - Renamed S3 endpoint
- [x] Service layers
  - [x] CollateralService - CRUD operations
  - [x] LoanTermsService - CRUD operations
  - [x] Update LoanService with v2 fields
  - [x] Update PropertyService with v2 fields
- [x] AI infrastructure
  - [x] forecast.ts - Heuristic ROI/risk calculations
  - [x] LTV calculation
  - [x] Monthly payment calculation
- [x] Helper components
  - [x] DrawScheduleBuilder
  - [x] ParticipationSplits
- [x] TypeScript compilation ✅ BUILD SUCCESSFUL
- [x] Update LoanStatus enum (removed ACTIVE, PAID_OFF; added REJECTED)
- [x] Update loan state machine
- [x] Fix all backward compatibility issues
- [x] Apply database migration (0004_loan_builder_v2.sql)
- [x] Apply database migration (0005_fix_hybrid_relations.sql)
- [x] Test hybrid relationship model API endpoints
- [x] Verify Loan Builder v2 works with all 3 categories
- [x] Fix Next.js 16 async params pattern in new API routes
- [x] Build passes successfully ✅

## Sprint 3 - Payments & Draws (🔨 Phase 1 Complete)
- [x] Create comprehensive technical specification document
- [x] Design payments and draws database schema
- [x] Design draw workflow and inspection tracking schema
- [x] Architecture design for PaymentService, DrawService, and LoanBalanceService
- [x] Define API endpoints for payments and draws with request/response schemas
- [x] Plan UI components for payment history, draw requests, and mobile inspector
- [x] Create payments table (migration 0006)
- [x] Create draws table (migration 0006)
- [x] Create inspections table (migration 0006)
- [x] Create payment_schedules table (migration 0006)
- [x] Create draw_schedules table (migration 0006)
- [x] Implement PaymentService with balance calculations
- [x] Implement DrawService with workflow management
- [x] Implement InspectionService with photo tracking
- [x] Create payment API endpoints (7 routes)
- [x] Create draw API endpoints (3 routes)
- [x] Create inspection API endpoints (3 routes)
- [x] Build passes successfully ✅
- [ ] Build payment history UI (Phase 2)
- [ ] Build payment entry form (Phase 2)
- [ ] Build balance summary cards (Phase 2)
- [ ] Build draw request wizard (Phase 3)
- [ ] Build draw timeline tracker (Phase 3)
- [ ] Build budget charts (Phase 3)
- [ ] Build draw approval dashboard (Phase 3)
- [ ] Build mobile inspector UI (PWA) (Phase 4)

## Sprint 4 - Analytics & Dashboard (Planned)
- [ ] Create portfolio snapshots job
- [ ] Build analytics API endpoints
- [ ] Create Tremor dashboard components
- [ ] Implement KPI cards and charts
- [ ] Add filters and date ranges

## Technical Notes
- Built with Next.js 16, TypeScript, Tailwind CSS v4
- Uses Shadcn UI for components
- Follows colocation-based architecture
- Includes authentication and role-based access control
