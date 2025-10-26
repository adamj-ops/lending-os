# Project Notebook - Lending OS

## Installation Notes
- Successfully cloned the Next.js Shadcn Admin Dashboard template
- Dependencies installed without vulnerabilities
- Template includes comprehensive UI components and dashboard layouts

## Template Analysis
The template provides an excellent foundation with:
- Modern Next.js 16 architecture with App Router
- Comprehensive Shadcn UI component library
- Multiple dashboard layouts (Default, CRM, Finance)
- Authentication system with social login support
- Theme customization capabilities
- Responsive design patterns
- TypeScript support throughout

## Architecture Insights
- **Colocation-based architecture**: Each feature keeps its own pages, components, and logic inside its route folder
- **Shared UI components**: Located in `src/components/ui/` for global reuse
- **Route-specific components**: Placed in `_components/` folders within each route
- **Private folders**: Using `_components/` prefix opts folders out of routing system
- **State management**: Uses Zustand for preferences and layout state
- **Styling**: Tailwind CSS v4 with custom theme presets
- **Forms**: React Hook Form with Zod validation
- **Route groups**: `(main)` and `(external)` organize core app vs public-facing pages

## Lending OS Considerations
For a lending operating system, we'll need to focus on:
- Loan application workflows
- Borrower management
- Loan tracking and status updates
- Payment processing integration
- Document management
- Compliance and reporting
- Risk assessment tools
- Credit scoring integration

## Technical Decisions
- Maintain the existing authentication system
- Leverage the responsive design patterns
- Use the existing data table components for loan listings
- Build upon the dashboard layout system
- Utilize the theme customization for branding

## Development Environment
- Node.js project with npm package management
- TypeScript for type safety
- ESLint and Prettier for code quality
- Husky for git hooks
- Tailwind CSS for styling

## Sprint 3 Phase 1 Key Learnings (October 26, 2025)

### Drizzle Date Field Handling
- Date fields (`date()` type) return strings in `YYYY-MM-DD` format, not Date objects
- Always convert to string format: `new Date().toISOString().split('T')[0]`
- Update TypeScript types to reflect this: `paymentDate: string` not `Date`
- Timestamp fields (`timestamp()`) do return Date objects

### Enum Naming Conflicts
- Avoid duplicate enum names across schema files
- Use descriptive names to prevent conflicts (e.g., `paymentTransactionTypeEnum` vs `paymentTypeEnum`)
- Or use text fields with validation instead of enums for flexibility

### Migration Management
- Delete migration files carefully - must also update `meta/_journal.json`
- Remove orphaned entries from journal or migrations will fail
- Use `drizzle-kit generate --name custom_name` for readable migration names

### Service Layer Patterns
- CRUD operations first, then specialized methods
- Group methods by functionality (payments, schedules, balance, reporting)
- Use private helper methods for complex calculations
- Return properly typed objects, not raw DB results

### API Endpoint Structure
- Follow Next.js 16 async params pattern: `{ params: Promise<{ id: string }> }`
- Always await params before use: `const { id } = await params;`
- Group related endpoints by resource hierarchy
- Use consistent error handling and response format

### JSONB Storage
- Store as text in Drizzle: `photos: text("photos")`
- Serialize/deserialize in service layer: `JSON.stringify()` / `JSON.parse()`
- Initialize with empty arrays: `JSON.stringify([])`
- Type arrays properly: `PhotoData[]` not `any`

## Sprint 2B Key Learnings (October 25, 2025)

### Next.js 16 Migration Patterns
- Route handlers with [id] params now require async Promise pattern
- Old: `{ params }: { params: { id: string } }`
- New: `{ params }: { params: Promise<{ id: string }> }`
- Must await params: `const { id } = await params;`

### Drizzle ORM Best Practices
- Avoid circular schema dependencies
- Delete operations simplified (no rowCount needed)
- Use unidirectional foreign key relationships where possible

### File Upload Architecture
- Presigned URLs pattern is superior for S3 uploads
- Client-to-S3 direct upload reduces server load
- Store file metadata separately in database
- FileUpload component is highly reusable

### Wizard UX Patterns
- Zustand ideal for multi-step form state
- Progress indicator improves perceived completion
- Allow navigation to previous steps for editing
- Show comprehensive summary before final submission
- Support both "select existing" and "create new" modes

### DataTable Component Usage
- Template uses `useDataTableInstance` hook pattern
- Created `SimpleDataTable` wrapper for simpler usage
- Prefer SimpleDataTable for standard CRUD lists
- Use full DataTable with useDataTableInstance for advanced features (DnD, etc)

## Architectural Evolution (October 26, 2025)

### From Route-Centric to Domain-Centric

LendingOS is evolving from a **route-centric colocation** pattern to a **domain-driven colocation** architecture.

**Before (v1)**:
- Routes organized by workflow (applications, approvals, payments)
- UI components colocated with routes
- Services centralized in `src/services/`
- Cross-domain logic scattered

**Now (v2 - Transitioning)**:
- Domains organized by business capability (Loan, Borrower, Fund, Payment, Compliance)
- Each domain owns UI + API + data + logic (vertical slices)
- Event-driven communication between domains
- Clear domain boundaries

### Key Architectural Decisions

1. **Domain Colocation**: UI, actions, schemas, and data logic live together per domain
2. **Event Bus**: Cross-domain communication via events instead of direct service calls
3. **API Versioning**: v1 (current) will coexist with v2 (domain-centric) during migration
4. **Gradual Migration**: No breaking changes; domains migrated incrementally
5. **Event Sourcing**: All domain events stored for auditability and analytics

### The Five Domains

1. **Loan Domain**: Loan lifecycle, collateral, documents (Sprint 1-3 Complete)
2. **Payment Domain**: Payment processing, schedules, reconciliation (Sprint 3 Complete)
3. **Borrower Domain**: CRM, KYC verification, relationships (Sprint 2 Complete)
4. **Fund Domain**: Investor management, capital deployment (Planned - Sprint 4+)
5. **Compliance Domain**: Regulatory filings, document automation (Planned - Sprint 5+)

### Migration Strategy

- **Sprint 4**: Implement event bus, establish domain rules
- **Sprint 5**: Migrate existing domains to new structure
- **Sprint 6**: Enable event handlers and automation
- **Sprint 7-8**: Add Fund and Compliance domains
- **Sprint 9**: Deprecate v1 API, cleanup

### Documentation Structure

New centralized documentation:
```
.cursor/
├── docs/
│   ├── architecture/      # v2 architecture, events, migration
│   ├── domains/           # Per-domain documentation
│   ├── technical/         # Database, API, tech stack
│   └── sprints/           # Sprint summaries
├── notes/
│   └── session-notes/     # Dated session files
└── rules/
    └── domain-rules.md    # Development guidelines
```

---

## Interesting Findings

### Loan Progress Calculations
The amortization formula for monthly payment:
```
monthlyPayment = (P × r × (1 + r)^n) / ((1 + r)^n - 1)
```
Where:
- P = Principal (loan amount)
- r = Monthly interest rate (annual rate / 12)
- n = Number of payments (term in months)

Implemented in `progress-tab.tsx` for real-time calculations.

### S3 Folder Organization
Files organized by type with timestamp prefixes:
- `loan-documents/1729872000000-filename.pdf`
- Prevents filename collisions
- Makes chronological sorting easy
- Enables folder-based lifecycle rules

### Component Reusability
The FileUpload component is used in:
1. Documents tab in loan drawer
2. Documents step in loan wizard
3. Can be reused for property photos
4. Can be reused for borrower documents

Same component, different folders, different upload contexts.
