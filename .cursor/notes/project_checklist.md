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
- [x] Complete Sprint 2 Database & CRUD
- [x] Complete Sprint 2B Loan Details & Wizard v1
- [x] Complete Sprint 2C Loan Builder v2 Transformation
- [x] Complete Sprint 3 Phase 1 (Backend Infrastructure)
- [x] Complete Sprint 3 Phase 2 (UI Components) ✅

## Next Steps
1. Test all UI components with real data and API integration
2. Test mobile responsiveness and PWA functionality
3. Implement lazy loading and optimize bundle size
4. Begin Sprint 4 - Analytics & Dashboard

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

## Sprint 3 - Payments & Draws (✅ Complete)

### Phase 1 - Backend Infrastructure (✅ Complete)
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

### Phase 2 - UI Components (✅ Complete)
- [x] Set up Sprint 3 Phase 2 development environment
- [x] Install required shadcn components (table, card, form, badge, button, dialog, calendar, progress, spinner, alert, breadcrumb, navigation-menu)
- [x] Install additional dependencies (@tanstack/react-table, @xyflow/react, ai, @kibo-ui/choicebox, @kibo-ui/form, @kibo-ui/pill)
- [x] Set up photo capture component from capture-photo repository
- [x] Set up FullCalendar integration (month and week views only)
- [x] Create shared components
  - [x] DataTable (TanStack Table based)
  - [x] StatusBadge (consistent status indicators)
  - [x] AmountDisplay (currency formatting)
  - [x] CurrencyInput (currency input fields)
  - [x] DateRangePicker (date range selection)
  - [x] ProgressBar (visual progress indicators)
  - [x] FormField (consistent form field wrapper)
- [x] Create payment management components
  - [x] PaymentHistoryTable (display payment history)
  - [x] PaymentForm (create/edit payment records)
  - [x] PaymentSummaryCard (display payment summary metrics)
- [x] Create payment schedule components
  - [x] PaymentScheduleGenerator (generate payment schedules)
  - [x] SchedulePreview (preview payment schedules)
  - [x] PaymentFrequencySelector (select payment frequency)
  - [x] ScheduleTemplateSelector (select schedule templates)
- [x] Create draw request components
  - [x] DrawRequestForm (submit draw requests)
  - [x] DrawRequestList (list draw requests)
  - [x] DrawApprovalWorkflow (manage draw approvals)
  - [x] DrawStatusTracker (track draw status)
- [x] Create draw schedule components
  - [x] DrawScheduleView (view draw schedules)
  - [x] BudgetLineItemEditor (edit budget line items)
  - [x] DrawProgressChart (visualize draw progress)
  - [x] BudgetAllocationView (view budget allocation)
- [x] Create inspection workflow components
  - [x] InspectionScheduler (schedule inspections)
  - [x] InspectionForm (create/edit inspection records)
  - [x] InspectionChecklist (manage inspection checklists)
  - [x] PhotoUploader (upload inspection photos)
- [x] Create mobile inspector PWA components
  - [x] MobileInspectionApp (core mobile inspection PWA)
  - [x] OfflineInspectionForm (offline inspection forms)
  - [x] PhotoCapture (camera support)
  - [x] GPSLocationCapture (GPS location capture)
- [x] Create dashboard components
  - [x] PaymentDashboard (server/client hybrid approach)
  - [x] DrawDashboard (metrics and activity feed)
  - [x] InspectionDashboard (workload distribution)
- [x] Integrate AI SDK features
  - [x] AI-powered payment analysis
  - [x] Draw risk assessment
  - [x] Inspection recommendations
  - [x] Floating AI chat assistant widget
- [x] Create workflow visualization components
  - [x] Workflow definition files for payment/draw/inspection flows
  - [x] React Flow visualization components (read-only)
  - [x] WorkflowViewer (interactive workflow display)
  - [x] WorkflowStatus (workflow progress tracking)
  - [x] WorkflowLegend (workflow element legend)
  - [x] Add workflow viewers to all dashboards
- [x] Set up PWA functionality
  - [x] Create PWA manifest
  - [x] Configure service worker
  - [x] Update layout.tsx for PWA metadata
  - [x] Create /inspector route for mobile field use
- [x] Build passes successfully ✅

### Phase 3 - Testing & Optimization (🔨 In Progress)
- [ ] Test all UI components with real data and API integration
- [ ] Test mobile responsiveness across different viewport sizes
- [ ] Test PWA install, offline mode, and sync functionality
- [ ] Implement lazy loading and optimize bundle size
- [ ] Performance testing and optimization
- [ ] Accessibility testing (WCAG 2.1 AA compliance)
- [ ] Error handling and edge case testing

## Sprint 4 - Domain-Driven Analytics & Event-Linked Dashboards (🔨 In Progress)

### Phase 1 - Analytics Infrastructure (✅ Complete)
- [x] Create analytics snapshot schema and migration
- [x] Implement analytics.service with compute and query methods
- [x] Create domain analytics API endpoints
  - [x] /api/v1/funds/analytics (portfolio-level metrics)
  - [x] /api/v1/loans/analytics (loan KPI analytics)
  - [x] /api/v1/payments/analytics (collections aging analytics)
  - [x] /api/v1/inspections/analytics (inspections productivity analytics)
- [x] Create /api/v1/events/stream for dev testing
- [x] Add Vercel Cron and snapshot runner route
- [x] Implement analytics overview page with KPIs and trends
- [x] Implement loans analytics page
- [x] Implement collections analytics page
- [x] Implement inspections analytics page
- [x] Add cache tags and revalidation to analytics routes

### Phase 2 - Advanced Features (📋 Planned)
- [ ] Add CSV export for analytics tables
- [ ] Add unit/integration tests for analytics services/APIs
- [ ] Document metrics and dashboards
- [ ] Implement real-time event processing
- [ ] Add advanced filtering and drill-down capabilities
- [ ] Create custom dashboard builder
- [ ] Add alerting and threshold monitoring

## Technical Notes
- Built with Next.js 16, TypeScript, Tailwind CSS v4
- Uses Shadcn UI for components
- Follows colocation-based architecture
- Includes authentication and role-based access control
- AI SDK integration with OpenAI and Anthropic
- PWA support for mobile inspector app
- React Flow for workflow visualization
- FullCalendar for scheduling
- TanStack Table for data tables
- Zustand for state management
- Drizzle ORM for database operations
