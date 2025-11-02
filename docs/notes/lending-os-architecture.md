# Lending OS - Colocation Architecture Specification

## Overview
This document outlines how we'll structure the lending operating system using the colocation-based architecture pattern from the [Next Colocation Template](https://github.com/arhamkhnz/next-colocation-template.git).

## Colocation Principles for Lending OS

### Core Architecture Benefits
- **Feature Isolation**: Each lending workflow (applications, approvals, payments) is self-contained
- **Scalability**: Easy to add new lending products or features without affecting existing code
- **Maintainability**: Related components, logic, and pages live together
- **Team Collaboration**: Multiple developers can work on different lending features simultaneously

### File Structure Strategy

```
src/
└── app/
    ├── (main)/                    # Core lending application
    │   ├── dashboard/             # Main dashboard
    │   │   ├── page.tsx
    │   │   ├── layout.tsx
    │   │   └── _components/       # Dashboard-specific components
    │   ├── loans/                # Loan management routes
    │   │   ├── applications/     # Loan applications
    │   │   │   ├── page.tsx
    │   │   │   ├── _components/  # Application form components
    │   │   │   └── schema.ts     # Application validation
    │   │   ├── approvals/        # Loan approval workflow
    │   │   │   ├── page.tsx
    │   │   │   └── _components/  # Approval components
    │   │   └── active/           # Active loans
    │   │       ├── page.tsx
    │   │       └── _components/  # Loan tracking components
    │   ├── borrowers/            # Borrower management
    │   │   ├── page.tsx
    │   │   ├── _components/      # Borrower profile components
    │   │   └── schema.ts         # Borrower data validation
    │   ├── payments/             # Payment processing
    │   │   ├── page.tsx
    │   │   └── _components/      # Payment form components
    │   └── reports/              # Reporting and analytics
    │       ├── page.tsx
    │       └── _components/      # Chart and report components
    ├── (external)/               # Public-facing pages
    │   ├── apply/                # Public loan application
    │   │   ├── page.tsx
    │   │   └── _components/      # Public application form
    │   └── page.tsx              # Landing page
    ├── components/               # Global UI components
    ├── lib/                      # Shared utilities
    ├── hooks/                    # Reusable hooks
    └── navigation/               # Navigation configuration
```

## Lending-Specific Route Organization

### 1. Loan Applications (`/loans/applications/`)
- **Purpose**: Handle new loan applications
- **Components**: Application forms, document upload, validation
- **Logic**: Application processing, initial screening
- **Schema**: Loan application data validation

### 2. Loan Approvals (`/loans/approvals/`)
- **Purpose**: Review and approve/reject applications
- **Components**: Review interface, decision forms, workflow controls
- **Logic**: Approval workflow, risk assessment integration
- **Schema**: Approval decision validation

### 3. Active Loans (`/loans/active/`)
- **Purpose**: Manage active loan accounts
- **Components**: Loan details, payment history, status tracking
- **Logic**: Payment processing, loan modifications
- **Schema**: Loan status and payment validation

### 4. Borrower Management (`/borrowers/`)
- **Purpose**: Customer relationship management
- **Components**: Borrower profiles, contact information, history
- **Logic**: Borrower data management, communication tracking
- **Schema**: Borrower information validation

### 5. Payment Processing (`/payments/`)
- **Purpose**: Handle loan payments and collections
- **Components**: Payment forms, processing interfaces, receipt generation
- **Logic**: Payment validation, gateway integration, reconciliation
- **Schema**: Payment data validation

### 6. Reporting & Analytics (`/reports/`)
- **Purpose**: Business intelligence and compliance reporting
- **Components**: Charts, tables, export functionality
- **Logic**: Data aggregation, report generation
- **Schema**: Report parameter validation

## Shared Components Strategy

### Global Components (`src/components/`)
- **UI Primitives**: Buttons, forms, tables, charts
- **Layout Elements**: Headers, sidebars, navigation
- **Business Components**: Loan status badges, payment buttons, borrower cards

### Route-Specific Components (`_components/`)
- **Application Forms**: Specific to loan application workflow
- **Approval Interfaces**: Custom to approval process
- **Payment Forms**: Tailored to payment processing
- **Report Widgets**: Specific to reporting needs

## Data Flow and State Management

### Colocated State
- **Route-level state**: Form data, UI state within each route
- **Component state**: Local component interactions
- **Server state**: Data fetching and caching per route

### Global State (Zustand)
- **User preferences**: Theme, layout, notifications
- **Authentication**: User session, permissions
- **Navigation**: Active routes, breadcrumbs

## Benefits for Lending OS

### 1. **Modular Development**
- Each lending feature can be developed independently
- Easy to add new loan products or lending types
- Clear separation of concerns

### 2. **Scalability**
- New lending workflows don't affect existing code
- Easy to onboard new team members to specific features
- Reduced coupling between different lending processes

### 3. **Maintainability**
- Related code lives together
- Easy to locate and modify specific lending features
- Clear boundaries between different business processes

### 4. **Testing**
- Each route can be tested independently
- Mock data and test utilities can be colocated
- Clear test boundaries

## Implementation Strategy

### Phase 1: Core Structure
- Set up route groups and basic navigation
- Implement authentication and dashboard
- Create shared component library

### Phase 2: Lending Workflows
- Build loan application workflow
- Implement borrower management
- Add basic reporting

### Phase 3: Advanced Features
- Payment processing integration
- Advanced reporting and analytics
- Compliance and audit features

## References
- [Next Colocation Template](https://github.com/arhamkhnz/next-colocation-template.git)
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Shadcn UI Components](https://ui.shadcn.com/)
