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
