# Agent Notes - Lending OS Project

## Project Context
This is a lending operating system project starting with the Next.js Shadcn Admin Dashboard template. The template provides a solid foundation with modern UI components, authentication, and multiple dashboard layouts.

## Template Information
- **Repository**: https://github.com/arhamkhnz/next-shadcn-admin-dashboard.git
- **Framework**: Next.js 16 with App Router
- **UI**: Shadcn UI components
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Architecture**: Colocation-based file system

## Available Dashboards
1. **Default Dashboard** - General purpose with data tables and charts
2. **CRM Dashboard** - Customer relationship management focused
3. **Finance Dashboard** - Financial overview and currency exchange
4. **Authentication** - Login/register flows with social auth

## Key Features
- Responsive and mobile-friendly
- Customizable theme presets (light/dark modes)
- Flexible layouts with collapsible sidebar
- Pre-built authentication flows
- Role-based access control (RBAC) support
- Multiple color schemes (Tangerine, Neo Brutalism, Soft Pop)

## Project Structure
- `src/app/` - App router pages and layouts
- `src/components/` - Reusable UI components
- `src/lib/` - Utility functions
- `src/hooks/` - Custom React hooks
- `src/stores/` - State management (Zustand)
- `src/navigation/` - Navigation configuration

## Development Approach
- Use the existing dashboard layouts as starting points
- Customize for lending-specific workflows
- Maintain the modern, clean design aesthetic
- Leverage the existing authentication system
- Build upon the responsive design patterns

## User Preferences
- Prefer shadcn icon components over emojis
- Focus on clean, modern UI design
- Maintain responsive design principles
- Use TypeScript for type safety

## Current Sprint Status

**Sprint 2C - Loan Builder v2**: ✅ COMPLETE (October 25, 2025)
- Multi-category loan system (Asset-Backed, Yield Note, Hybrid)
- Adaptive 8-step wizard with React Hook Form + Zod validation
- Draft persistence with localStorage auto-save
- AI forecast infrastructure (heuristic-based ROI/risk)
- Comprehensive type system with discriminated unions
- Fee management in basis points (BPS)
- All TypeScript build errors resolved
- Build passing successfully ✅
- Dev server running

**Previous**: Sprint 2B - Loan Detail Drawer & Wizard v1 (✅ Complete)
- Loan detail drawer with 7 tabs
- Original 7-step wizard (now v1, kept for compatibility)
- AWS S3 file upload integration

## Recent Architectural Changes

### Loan Builder v2 (Latest)
- **Multi-Category System**: 3 loan types with adaptive validation
- **Schema Enhancements**: loan_category, payment enums, fee fields (BPS), loan_terms table, collateral table
- **Borrower/Lender Updates**: type field, name for entities, taxIdEncrypted, contactPhone, IRA support
- **Property Updates**: organizationId (required), occupancy, estimatedValue, rehabBudget, photos (JSONB)
- **State Management**: React Hook Form + Zod + Zustand hybrid approach
- **Draft Persistence**: localStorage with auto-save on step navigation
- **AI Integration**: Forecast stub ready for Phase 4 ML models

### Database Schema (v2)
- Removed circular dependency between loans and properties tables
- Properties no longer have loanId field (one-way relationship from loans to properties)
- Added loan_documents, loan_notes, loan_terms, collateral tables
- principal and rate replace deprecated loanAmount and interestRate
- All new columns include defaults for backward compatibility

### Next.js 16 Patterns
- All [id] route handlers updated to use async params: `{ params: Promise<{ id: string }> }`
- Must await params before use: `const { id } = await params;`

### Drizzle ORM Updates
- Delete methods simplified (no rowCount check needed)
- Pattern: `await db.delete(table).where(eq(table.id, id)); return true;`

## Important Files & Locations

### Documentation
- `docs/loan-builder-v2-spec.md` - ⭐ **AUTHORITATIVE v2 SPECIFICATION**
- `.cursor/notes/v2-implementation-summary.md` - Complete v2 summary
- `.cursor/notes/READY-FOR-TESTING.md` - Testing guide
- `.cursor/notes/project_checklist.md` - Sprint progress tracking
- `.cursor/notes/sprint-2b-summary.md` - Sprint 2B summary
- `.cursor/docs/aws-s3-setup.md` - AWS S3 configuration

### Key Components (v2)
- `src/app/(main)/dashboard/loans/_components/loan-wizard.tsx` - ⭐ Main wizard (v2 refactored)
- `src/features/loan-builder/steps/StepCategory.tsx` - Category selection
- `src/features/loan-builder/steps/StepParty.tsx` - Borrower/lender (368 lines)
- `src/features/loan-builder/steps/StepAsset.tsx` - Property/investment
- `src/features/loan-builder/steps/StepCollateral.tsx` - Collateral & draws
- `src/features/loan-builder/steps/StepForecast.tsx` - AI forecast UI
- `src/features/loan-builder/schemas.ts` - Zod validation (247 lines)
- `src/features/loan-builder/types.ts` - TypeScript types (183 lines)
- `src/features/loan-builder/store.ts` - Zustand store (166 lines)

### Services (v2 Enhanced)
- `src/services/loan.service.ts` - v2 loan operations
- `src/services/collateral.service.ts` - NEW: Collateral CRUD
- `src/services/loan-terms.service.ts` - NEW: Extended terms CRUD
- `src/lib/ai/forecast.ts` - NEW: AI forecast engine (166 lines)

### API Endpoints (v2)
- `POST /api/v1/loans/v2` - v2 loan creation
- `POST /api/v1/analytics/forecast` - AI forecast
- `POST /api/v1/uploads/sign` - S3 signed URLs

## Next Session Priorities

1. **Apply Database Migration** (CRITICAL):
   ```bash
   npm run db:migrate
   ```
   - Review: `src/db/migrations/0004_loan_builder_v2.sql`
   - Verify all columns/tables created
   - Run seed script to populate v2 fields

2. **Test Loan Builder v2**:
   - Test asset-backed loan creation (full workflow)
   - Test yield note creation (investor agreement)
   - Test hybrid loan creation (flexible)
   - Test draft save/resume functionality
   - Verify all 3 categories work end-to-end
   - Check validation error handling

3. **Configure AWS S3** (Deferred):
   - Add credentials to .env.local
   - Test property photo uploads
   - Test document uploads

4. **Sprint 3 Preparation**:
   - Plan payments and draws tables
   - Design payment processing workflow
   - Architect mobile inspector app (PWA)

## Known Technical Debt
- User attribution hardcoded (needs session integration)
- Organization ID hardcoded in wizard (needs session-based resolution)
- SimpleDataTable wrapper created for backward compatibility (consider migrating to useDataTableInstance pattern)
- Documents step in wizard could use RHF integration (currently works with old pattern)
- Property photo S3 upload not yet integrated in StepAsset (JSONB field ready)
- Migration generated manually due to drizzle-kit interactive prompts

## v2 Testing Notes
- Database migration SQL ready but NOT YET APPLIED
- All code compiles with zero TypeScript errors
- Dev server running successfully
- Wizard accessible at /dashboard/loans → "New Loan"
- Test all 3 categories before declaring production-ready
