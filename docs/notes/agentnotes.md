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

**Sprint 3 - Phase 2: UI Components**: ✅ COMPLETE (January 15, 2025)
- Complete UI component library for payments, draws, and inspections
- Shared components (DataTable, StatusBadge, CurrencyInput, etc.)
- Payment management components (PaymentHistoryTable, PaymentForm, PaymentSummaryCard)
- Payment schedule components (PaymentScheduleGenerator, SchedulePreview, etc.)
- Draw request components (DrawRequestForm, DrawRequestList, DrawApprovalWorkflow)
- Draw schedule components (DrawScheduleView, BudgetLineItemEditor, DrawProgressChart)
- Inspection workflow components (InspectionScheduler, InspectionForm, InspectionChecklist)
- Mobile inspector PWA components (MobileInspectionApp, OfflineInspectionForm)
- Dashboard components (PaymentDashboard, DrawDashboard, InspectionDashboard)
- AI SDK integration (payment analysis, draw risk assessment, inspection recommendations)
- Workflow visualization (React Flow components with predefined workflows)
- PWA functionality (manifest, service worker, mobile inspector route)
- All components built with TypeScript and responsive design
- Build passing successfully ✅

**Sprint 3 - Phase 1: Payments & Draws Backend**: ✅ COMPLETE (October 26, 2025)
- Complete database schema (5 new tables: payments, draws, inspections, payment_schedules, draw_schedules)
- Service layer (PaymentService, DrawService, InspectionService)
- API endpoints (13 new REST routes)
- Payment schedule generation (amortized & interest-only)
- Draw approval workflow
- Budget tracking and reporting
- All TypeScript build errors resolved
- Build passing successfully ✅
- Migration 0006 applied successfully

**Sprint 2C - Loan Builder v2 & Hybrid Model**: ✅ COMPLETE (October 25-26, 2025)
- Multi-category loan system (Asset-Backed, Yield Note, Hybrid)
- Adaptive 8-step wizard with React Hook Form + Zod validation
- Hybrid relationship model (co-borrowers, syndicated lenders)
- Junction table tracking with roles and percentages
- Draft persistence with localStorage auto-save
- AI forecast infrastructure (heuristic-based ROI/risk)
- Migration 0004 and 0005 applied successfully

**Previous**: Sprint 2B - Loan Detail Drawer & Wizard v1 (✅ Complete)
- Loan detail drawer with 7 tabs
- Original 7-step wizard (now v1, kept for compatibility)
- AWS S3 file upload integration

## Recent Architectural Changes

### Sprint 3 Phase 2 (Latest)
- **UI Component Library**: Comprehensive set of reusable components for payments, draws, and inspections
- **Dashboard Integration**: Server/client hybrid approach for optimal performance
- **AI Integration**: AI SDK with OpenAI and Anthropic for intelligent features
- **Workflow Visualization**: React Flow integration for process visualization
- **PWA Support**: Mobile inspector app with offline functionality
- **Responsive Design**: Mobile-first approach with touch-friendly interfaces

### AI SDK Integration
- **Configuration**: Multi-provider setup (OpenAI, Anthropic) with fallback
- **Payment Analysis**: AI-powered payment pattern analysis and recommendations
- **Draw Risk Assessment**: Intelligent risk scoring for draw approvals
- **Inspection Assistant**: AI recommendations for inspection workflows
- **Chat Assistant**: Floating AI chat widget for user assistance

### Workflow Visualization
- **React Flow**: Interactive workflow diagrams for payment, draw, and inspection processes
- **Predefined Workflows**: Standardized process flows with visual representation
- **Status Tracking**: Real-time workflow progress indicators
- **Interactive Elements**: Zoom, pan, and minimap functionality

### PWA Implementation
- **Mobile Inspector**: Dedicated PWA for field inspections
- **Offline Support**: Service worker for offline functionality
- **Camera Integration**: Photo capture with camera API
- **GPS Integration**: Location services for inspection sites
- **Data Sync**: Offline data synchronization when online

## Important Files & Locations

### Documentation
- `docs/sprint3-phase2-testing-guide.md` - ⭐ **COMPREHENSIVE TESTING GUIDE**
- `.cursor/notes/sprint3-payments-draws-spec.md` - ⭐ **SPRINT 3 SPECIFICATION**
- `.cursor/notes/sprint3-phase1-implementation.md` - Phase 1 complete summary
- `.cursor/notes/sprint3-ui-components-plan.md` - UI component planning
- `.cursor/notes/project_checklist.md` - ⭐ **UPDATED PROJECT CHECKLIST**
- `docs/ai-sdk-setup-guide.md` - AI SDK configuration guide
- `docs/vercel-deployment-guide.md` - Vercel deployment instructions

### Key Components (Sprint 3 Phase 2)
- `src/components/shared/` - ⭐ **SHARED COMPONENT LIBRARY**
- `src/components/payments/` - ⭐ **PAYMENT MANAGEMENT COMPONENTS**
- `src/components/draws/` - ⭐ **DRAW REQUEST COMPONENTS**
- `src/components/inspections/` - ⭐ **INSPECTION WORKFLOW COMPONENTS**
- `src/components/dashboard/` - ⭐ **DASHBOARD COMPONENTS**
- `src/components/workflows/` - ⭐ **WORKFLOW VISUALIZATION**
- `src/components/ai/` - ⭐ **AI INTEGRATION COMPONENTS**
- `src/lib/workflows/definitions.ts` - ⭐ **WORKFLOW DEFINITIONS**

### Services (Enhanced)
- `src/services/payment.service.ts` - Payment tracking & schedules (310 lines)
- `src/services/draw.service.ts` - Draw workflow management (280 lines)
- `src/services/inspection.service.ts` - Inspection tracking (310 lines)
- `src/lib/ai/config.ts` - ⭐ **AI SDK CONFIGURATION**
- `src/lib/ai/utils.ts` - ⭐ **AI UTILITY FUNCTIONS**

### API Endpoints (Enhanced)
- **Payment endpoints** (7 routes) - Payment tracking
- **Draw endpoints** (6 routes) - Draw management
- **Inspection endpoints** (5 routes) - Inspection workflow
- `src/app/api/v1/ai/` - ⭐ **AI API ENDPOINTS**

### PWA Files
- `public/manifest.json` - ⭐ **PWA MANIFEST**
- `public/sw.js` - ⭐ **SERVICE WORKER**
- `src/app/(main)/inspector/page.tsx` - ⭐ **MOBILE INSPECTOR ROUTE**

## Next Session Priorities

1. **Sprint 3 Phase 3 - Testing & Optimization**:
   - Test all UI components with real data and API integration
   - Test mobile responsiveness across different viewport sizes
   - Test PWA install, offline mode, and sync functionality
   - Implement lazy loading and optimize bundle size
   - Performance testing and optimization
   - Accessibility testing (WCAG 2.1 AA compliance)

2. **Sprint 4 - Analytics & Dashboard**:
   - Create portfolio snapshots job
   - Build analytics API endpoints
   - Create Tremor dashboard components
   - Implement KPI cards and charts
   - Add filters and date ranges

3. **Production Readiness**:
   - Configure AWS S3 credentials
   - Set up production environment variables
   - Deploy to Vercel
   - Set up monitoring and logging

## Known Technical Debt
- User attribution hardcoded (needs session integration)
- Organization ID hardcoded in wizard (needs session-based resolution)
- SimpleDataTable wrapper created for backward compatibility (consider migrating to useDataTableInstance pattern)
- Documents step in wizard could use RHF integration (currently works with old pattern)
- Property photo S3 upload not yet integrated in StepAsset (JSONB field ready)
- Migration generated manually due to drizzle-kit interactive prompts

## Testing Notes
- Comprehensive testing guide created for all UI components
- All components built with TypeScript and responsive design
- PWA functionality ready for mobile testing
- AI SDK integration ready for API key configuration
- Workflow visualization ready for user testing
- Build passing successfully ✅

## Architecture Highlights
- **Server/Client Hybrid**: Optimal performance with server-side rendering and client-side interactivity
- **AI-Powered Features**: Intelligent analysis and recommendations throughout the platform
- **Workflow Visualization**: Visual process representation for complex lending workflows
- **Mobile-First PWA**: Dedicated mobile app for field inspections with offline support
- **Comprehensive Component Library**: Reusable, accessible, and responsive UI components
- **Type-Safe Development**: Full TypeScript coverage with proper type definitions
