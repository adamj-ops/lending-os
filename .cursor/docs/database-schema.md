# Database Schema Documentation - Sprint 1 MVP

## Overview

This document describes the minimal MVP database schema for Sprint 1 of Lending OS. The schema includes only the core tables needed for basic authentication and loan management.

## Schema Design Philosophy

- **Incremental Evolution**: Start with minimal tables, add complexity in future sprints
- **Nullable Foreign Keys**: Use nullable FKs for tables that will be added in Sprint 2 (borrowers, lenders, properties)
- **Type Safety**: Leverage Drizzle ORM for type-safe database operations
- **PostgreSQL-Specific**: Using Postgres features (UUIDs, enums, timestamps)

## Tables

### 1. users

Stores user authentication and profile information.

```typescript
{
  id: UUID (PK, auto-generated)
  email: TEXT (unique, not null)
  name: TEXT (not null)
  hashedPassword: TEXT (not null)
  createdAt: TIMESTAMP (default now)
  updatedAt: TIMESTAMP (default now)
}
```

**Relationships:**
- One-to-many with `sessions`
- Many-to-many with `organizations` through `user_organizations`

---

### 2. sessions

Stores active user sessions for BetterAuth.

```typescript
{
  id: UUID (PK, auto-generated)
  userId: UUID (FK -> users.id, cascade delete)
  token: TEXT (unique, not null)
  expiresAt: TIMESTAMP (not null)
  createdAt: TIMESTAMP (default now)
}
```

**Relationships:**
- Many-to-one with `users`

---

### 3. organizations

Represents lending companies/organizations.

```typescript
{
  id: UUID (PK, auto-generated)
  name: TEXT (not null)
  logoUrl: TEXT (nullable)
  createdAt: TIMESTAMP (default now)
  updatedAt: TIMESTAMP (default now)
}
```

**Relationships:**
- Many-to-many with `users` through `user_organizations`
- One-to-many with `loans`

---

### 4. user_organizations

Junction table for user-organization relationships.

```typescript
{
  userId: UUID (FK -> users.id, cascade delete)
  organizationId: UUID (FK -> organizations.id, cascade delete)
  role: TEXT (default "member")
  createdAt: TIMESTAMP (default now)
  
  PRIMARY KEY (userId, organizationId)
}
```

**Note:** The `role` field is a placeholder for Sprint 2 RBAC implementation.

---

### 5. loans

Core table for loan records.

```typescript
{
  id: UUID (PK, auto-generated)
  organizationId: UUID (FK -> organizations.id, cascade delete)
  borrowerId: UUID (nullable) // Will FK to borrowers in Sprint 2
  lenderId: UUID (nullable)   // Will FK to lenders in Sprint 2
  propertyAddress: TEXT (not null)
  loanAmount: NUMERIC(15,2) (not null)
  interestRate: NUMERIC(5,2) (not null)
  termMonths: INTEGER (not null)
  status: ENUM(draft, approved, funded, active, paid_off)
  fundedDate: TIMESTAMP (nullable)
  maturityDate: TIMESTAMP (nullable)
  createdAt: TIMESTAMP (default now)
  updatedAt: TIMESTAMP (default now)
}
```

**Status Flow:**
- `draft` → `approved` → `funded` → `active` → `paid_off`

**Relationships:**
- Many-to-one with `organizations`
- Will have many-to-one with `borrowers` (Sprint 2)
- Will have many-to-one with `lenders` (Sprint 2)

---

## Future Sprint Additions

### Sprint 2 Tables (Planned)

- **borrowers**: Borrower profiles and contact information
- **lenders**: Lender/investor accounts
- **properties**: Collateral property details
- **payments**: Payment transactions and history
- **draws**: Construction draw requests and approvals

### Sprint 3+ Tables (Planned)

- **documents**: File attachments and metadata
- **notes**: Internal notes and comments
- **audit_logs**: Change tracking and audit trail
- **notifications**: User notification queue

---

## Database Migrations

### Generating Migrations

```bash
npm run db:generate
```

This uses Drizzle Kit to compare schema files against the database and generate migration SQL.

### Running Migrations

```bash
npm run db:migrate
```

Applies pending migrations to the database.

### Drizzle Studio

```bash
npm run db:studio
```

Opens a web interface to browse and edit database records.

---

## Type Safety

Drizzle ORM provides full TypeScript type inference:

```typescript
import { db } from "@/db/client";
import { loans } from "@/db/schema";

// TypeScript knows the exact shape of the result
const result = await db.select().from(loans).where(eq(loans.status, "active"));
```

---

## Connection Details

- **Provider**: Neon Postgres (serverless)
- **Connection Pooling**: Configured in `src/db/client.ts`
- **Max Connections**: 10
- **Idle Timeout**: 20 seconds
- **Connect Timeout**: 10 seconds

---

## Seed Data

Run the seed script to populate test data:

```bash
npm run db:seed
```

**Test Account:**
- Email: admin@lendingos.com
- Password: password123
- Organization: Test Lending Company
- Sample Loans: 8 loans with various statuses

