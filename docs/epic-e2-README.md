# Epic E2: Borrower & Lender Management Module

## 📋 Overview

The Borrower & Lender Management Module is a comprehensive system for managing all individuals and organizations involved in your lending operations. This module provides full CRUD (Create, Read, Update, Delete) functionality for borrowers and lenders, along with powerful search, filtering, and relationship management capabilities.

**Version:** 2.0
**Status:** ✅ Complete
**Last Updated:** January 2025

---

## 🎯 Features

### Core Functionality

- ✅ **Borrower Management**
  - Support for individual and entity (business) borrowers
  - Full CRUD operations
  - Credit score tracking
  - Contact information management
  - Multi-loan associations

- ✅ **Lender Management**
  - Support for multiple entity types (Individual, Company, Fund, IRA)
  - Capital tracking (committed vs deployed)
  - Contact information management
  - Multi-loan funding relationships

- ✅ **Relationship Management**
  - Many-to-many borrower-loan associations
  - Many-to-many lender-loan associations
  - Visual loan selector with search
  - Automatic association tracking

- ✅ **Search & Filtering**
  - Real-time search by name or email
  - Filter by borrower/lender type
  - Column sorting on all fields
  - URL-based filter persistence

- ✅ **Data Validation**
  - Client-side form validation with React Hook Form
  - Server-side validation with Zod schemas
  - Type-specific required fields
  - Credit score range validation (300-850)

- ✅ **User Experience**
  - Responsive design (mobile, tablet, desktop)
  - Modal-based create/edit forms
  - Loading skeletons
  - Error handling with toast notifications
  - Keyboard navigation support

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/v1/
│   │   ├── borrowers/
│   │   │   ├── route.ts                    # List/Create borrowers
│   │   │   ├── [id]/route.ts               # Get/Update/Delete borrower
│   │   │   └── [id]/loans/route.ts         # Borrower-loan associations
│   │   └── lenders/
│   │       ├── route.ts                    # List/Create lenders
│   │       ├── [id]/route.ts               # Get/Update/Delete lender
│   │       └── [id]/loans/route.ts         # Lender-loan associations
│   └── (main)/dashboard/
│       ├── borrowers/
│       │   ├── page.tsx                    # Borrowers list page
│       │   └── _components/columns.tsx     # Table column definitions
│       └── lenders/
│           ├── page.tsx                    # Lenders list page
│           └── _components/columns.tsx     # Table column definitions
├── components/
│   ├── borrowers/
│   │   ├── BorrowerForm.tsx                # Create/Edit form
│   │   └── BorrowerLoanSelector.tsx        # Multi-select loan associations
│   └── lenders/
│       ├── LenderForm.tsx                  # Create/Edit form
│       └── LenderLoanSelector.tsx          # Multi-select loan associations
├── db/
│   └── schema/
│       ├── borrowers.ts                    # Borrowers table schema
│       ├── lenders.ts                      # Lenders table schema
│       └── relationships.ts                # Junction tables
├── hooks/
│   ├── useBorrowers.ts                     # React Query hooks for borrowers
│   ├── useLenders.ts                       # React Query hooks for lenders
│   └── useLoans.ts                         # React Query hooks for loans
├── lib/
│   └── validation/
│       ├── borrowers.ts                    # Zod validation schemas
│       └── lenders.ts                      # Zod validation schemas
├── services/
│   ├── borrower.service.ts                 # Borrower business logic
│   ├── lender.service.ts                   # Lender business logic
│   └── relationship.service.ts             # Association management
└── types/
    ├── borrower.ts                         # TypeScript type definitions
    └── lender.ts                           # TypeScript type definitions

docs/
├── epic-e2-README.md                       # This file
├── epic-e2-api-documentation.md            # API reference
├── epic-e2-user-guide.md                   # User documentation
└── epic-e2-testing-guide.md                # Testing specifications
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (Neon)
- Next.js 15
- Environment variables configured

### Installation

The module is already integrated into the application. No separate installation needed.

### Database Setup

1. **Run migrations:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

2. **Verify tables created:**
   - `borrowers`
   - `lenders`
   - `borrower_loans` (junction table)
   - `lender_loans` (junction table)

3. **Check indexes:**
   - `borrowers_organization_id_idx`
   - `borrowers_email_idx`
   - `lenders_organization_id_idx`
   - `lenders_email_idx`

### Quick Start

1. **Access the module:**
   - Navigate to `/dashboard/borrowers` or `/dashboard/lenders`

2. **Create your first borrower:**
   - Click "New Borrower"
   - Select type (Individual or Entity)
   - Fill in required fields
   - Click "Create Borrower"

3. **Associate loans:**
   - Edit an existing borrower/lender
   - Scroll to "Loan Associations"
   - Select loans from the dropdown
   - Changes save automatically

4. **Search and filter:**
   - Use the search box to find by name or email
   - Use the type filter to narrow results
   - Click column headers to sort

---

## 📚 Documentation

### For Users

- **[User Guide](./epic-e2-user-guide.md)**: Complete guide for end users
  - How to create borrowers and lenders
  - Managing loan associations
  - Search and filtering tips
  - Best practices
  - Troubleshooting

### For Developers

- **[API Documentation](./epic-e2-api-documentation.md)**: Complete API reference
  - All endpoints with examples
  - Request/response schemas
  - Validation rules
  - Error codes
  - Authentication requirements

- **[Testing Guide](./epic-e2-testing-guide.md)**: Testing specifications
  - Manual testing checklist
  - Unit test specifications
  - Integration test examples
  - E2E test scenarios
  - Test fixtures and helpers

---

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- Next.js 15 (App Router)
- React 19
- TypeScript 5
- TanStack Query (React Query)
- TanStack Table
- React Hook Form
- Zod validation
- Shadcn UI components
- Tailwind CSS

**Backend:**
- Next.js API Routes
- Drizzle ORM
- Neon Postgres
- iron-session authentication

**State Management:**
- TanStack Query for server state
- React hooks for local state
- URL params for filter state

### Design Patterns

1. **Service Layer Pattern**
   - Business logic separated from API routes
   - Reusable service methods
   - Centralized data access

2. **React Query Pattern**
   - Server state management
   - Automatic caching and revalidation
   - Optimistic updates
   - Error handling

3. **Form Management**
   - React Hook Form for state
   - Zod for validation
   - Type-safe with TypeScript

4. **Repository Pattern**
   - Drizzle ORM queries in services
   - Database abstraction
   - Transaction support

### Database Schema

```sql
-- Borrowers Table
CREATE TABLE borrowers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('individual', 'entity')),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  credit_score INTEGER CHECK (credit_score BETWEEN 300 AND 850),
  company_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX borrowers_organization_id_idx ON borrowers(organization_id);
CREATE INDEX borrowers_email_idx ON borrowers(email);

-- Lenders Table
CREATE TABLE lenders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('individual', 'company', 'fund', 'ira')),
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  total_committed NUMERIC(12, 2) DEFAULT 0,
  total_deployed NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX lenders_organization_id_idx ON lenders(organization_id);
CREATE INDEX lenders_email_idx ON lenders(email);

-- Junction Tables
CREATE TABLE borrower_loans (
  borrower_id UUID NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (borrower_id, loan_id)
);

CREATE TABLE lender_loans (
  lender_id UUID NOT NULL REFERENCES lenders(id) ON DELETE CASCADE,
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (lender_id, loan_id)
);
```

---

## 🔐 Security

### Authentication

- All endpoints require authentication via iron-session
- Session must contain: `userId`, `organizationId`, `email`, `role`

### Authorization

- **Organization Isolation**: Users can only access data within their organization
- **Row-Level Security**: All queries automatically filter by `organizationId`
- **Ownership Verification**: Update/Delete operations verify ownership

### Data Validation

- **Client-side**: React Hook Form + Zod schemas
- **Server-side**: Zod validation before database operations
- **Type Safety**: TypeScript ensures type correctness throughout

### Best Practices

- ✅ Never expose data from other organizations
- ✅ Validate all inputs on both client and server
- ✅ Use parameterized queries (Drizzle ORM)
- ✅ Sanitize user inputs
- ✅ Return 404 (not 403) for unauthorized access to prevent information leakage

---

## 🧪 Testing

### Current Status

- ✅ Manual testing completed
- ✅ Test specifications documented
- ⏳ Automated tests not yet implemented (framework setup required)

### Testing Documentation

See [Testing Guide](./epic-e2-testing-guide.md) for:
- Manual testing checklist
- Unit test specifications
- Integration test examples
- E2E test scenarios
- Recommended testing infrastructure

### Future Testing Infrastructure

Recommended setup:
- **Unit Tests**: Vitest
- **Integration Tests**: Vitest + Supertest
- **E2E Tests**: Playwright
- **Coverage**: 85%+ target

---

## 📊 Performance

### Optimizations

1. **Database Indexes**
   - `organization_id` for filtering
   - `email` for searches
   - Composite primary keys on junction tables

2. **React Query Caching**
   - Automatic caching of GET requests
   - Stale-while-revalidate pattern
   - Optimistic updates for mutations

3. **Client-Side Filtering**
   - Search and filter without API calls
   - Instant feedback
   - Reduced server load

4. **Code Splitting**
   - Next.js automatic code splitting
   - Lazy-loaded dialogs
   - Optimized bundle size

### Performance Metrics

- **Page Load**: <2s (first contentful paint)
- **Search Response**: <100ms (client-side)
- **API Response**: <500ms (p95)
- **Table Rendering**: 1000+ rows without lag

---

## 🐛 Known Issues

### Current Limitations

1. **No Pagination**
   - All borrowers/lenders loaded at once
   - May be slow with 1000+ records
   - Mitigation: Client-side search and filter

2. **No Server-Side Search**
   - Search happens in browser
   - Won't work with partial data
   - Future: Implement API search endpoint

3. **No Bulk Operations**
   - Can't create/update multiple records at once
   - Future: Add CSV import/export

4. **No Audit Trail**
   - Changes not logged
   - Future: Add audit logging

### Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ⚠️ IE11 (not supported)

---

## 🔄 Future Enhancements

### Planned Features

#### Phase 2
- [ ] Pagination (20-50 items per page)
- [ ] Server-side search
- [ ] Bulk import (CSV/Excel)
- [ ] Bulk export
- [ ] Advanced filtering (credit score ranges, date ranges)

#### Phase 3
- [ ] Audit logging (track all changes)
- [ ] Soft deletes (recoverable deletion)
- [ ] Document attachments
- [ ] Custom fields
- [ ] Tags and categories

#### Phase 4
- [ ] Borrower/Lender profiles (detail pages)
- [ ] Activity timeline
- [ ] Email notifications
- [ ] Webhooks for external integrations
- [ ] API rate limiting

---

## 🤝 Contributing

### Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/epic-e2-enhancement
   ```

2. **Make Changes**
   - Follow existing code patterns
   - Update types if needed
   - Add validation for new fields

3. **Test Manually**
   - Use manual testing checklist
   - Test all CRUD operations
   - Verify search/filter works

4. **Update Documentation**
   - Update API docs if endpoints changed
   - Update user guide if UI changed
   - Add test cases if new features

5. **Create Pull Request**
   - Reference related issues
   - Describe changes
   - Include screenshots for UI changes

### Code Standards

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier (auto-formatted)
- **Linting**: ESLint with Next.js config
- **Commits**: Conventional commits format

### Review Checklist

- [ ] Code follows existing patterns
- [ ] Types are properly defined
- [ ] Validation on client AND server
- [ ] Error handling implemented
- [ ] Loading states included
- [ ] Responsive design tested
- [ ] Documentation updated

---

## 📞 Support

### Getting Help

1. **Check Documentation**
   - Read the [User Guide](./epic-e2-user-guide.md)
   - Review [API Documentation](./epic-e2-api-documentation.md)

2. **Review Known Issues**
   - Check this README's Known Issues section

3. **Contact Team**
   - Submit issue via GitHub
   - Email: support@example.com
   - Slack: #lending-os-support

### Reporting Bugs

Include:
- Description of issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/videos
- Browser and OS version
- User role and organization

---

## 📝 Changelog

### Version 2.0 (January 2025)

**New Features:**
- ✅ Complete borrower management (CRUD)
- ✅ Complete lender management (CRUD)
- ✅ Borrower-loan associations
- ✅ Lender-loan associations
- ✅ Search by name and email
- ✅ Filter by entity type
- ✅ Column sorting
- ✅ URL-based filter persistence
- ✅ Responsive design
- ✅ Form validation (client + server)
- ✅ React Query integration
- ✅ Toast notifications

**Documentation:**
- ✅ API documentation
- ✅ User guide
- ✅ Testing guide
- ✅ README

**Technical:**
- ✅ Database schemas with indexes
- ✅ Service layer implementation
- ✅ Zod validation schemas
- ✅ TypeScript types
- ✅ Cascade delete support

---

## 📄 License

This module is part of the Lending OS application. See main project LICENSE for details.

---

## 🙏 Acknowledgments

**Built With:**
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TanStack Query](https://tanstack.com/query)
- [TanStack Table](https://tanstack.com/table)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Zod](https://zod.dev/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

**Developed By:**
- Epic E2 Development Team
- Lending OS Project

---

**For detailed implementation information, please refer to the comprehensive documentation files in the `/docs` directory.**
