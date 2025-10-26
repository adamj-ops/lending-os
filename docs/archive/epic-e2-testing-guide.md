# Epic E2: Testing Guide

## Overview

This document provides comprehensive testing guidelines for the Borrower & Lender Management Module, including test scenarios, expected behaviors, and recommended testing frameworks for future implementation.

---

## Table of Contents

1. [Manual Testing Checklist](#manual-testing-checklist)
2. [Unit Test Specifications](#unit-test-specifications)
3. [Integration Test Specifications](#integration-test-specifications)
4. [UI/E2E Test Specifications](#uie2e-test-specifications)
5. [Test Data Fixtures](#test-data-fixtures)
6. [Future Testing Infrastructure](#future-testing-infrastructure)

---

## Manual Testing Checklist

### Borrower CRUD Operations

#### Creating Borrowers

- [ ] **Individual Borrower - Happy Path**
  - Create with all fields filled
  - Verify data appears in table
  - Check email format validation
  - Verify credit score range (300-850)

- [ ] **Individual Borrower - Validation**
  - Try to create without first name (should fail)
  - Try to create without last name (should fail)
  - Try to create without email (should fail)
  - Try invalid email format (should fail)
  - Try credit score < 300 (should fail)
  - Try credit score > 850 (should fail)

- [ ] **Entity Borrower - Happy Path**
  - Create with all fields filled
  - Verify entity name displays correctly
  - Check that first/last name fields are hidden

- [ ] **Entity Borrower - Validation**
  - Try to create without entity name (should fail)
  - Try to create without email (should fail)

#### Updating Borrowers

- [ ] Update individual borrower's name
- [ ] Update borrower's email
- [ ] Update borrower's credit score
- [ ] Change borrower type from individual to entity
- [ ] Update with invalid data (should fail with validation)
- [ ] Verify changes persist after refresh

#### Deleting Borrowers

- [ ] Delete borrower without loan associations
- [ ] Delete borrower with loan associations (verify cascade)
- [ ] Verify borrower is removed from table
- [ ] Verify loan associations are removed

#### Reading/Viewing Borrowers

- [ ] View all borrowers in table
- [ ] Click edit to view single borrower
- [ ] Verify all data displays correctly
- [ ] Check that company name shows for individuals (if applicable)

### Lender CRUD Operations

#### Creating Lenders

- [ ] **Company Lender - Happy Path**
  - Create with all fields filled
  - Verify amounts display with currency formatting
  - Check utilization percentage calculation

- [ ] **Individual Lender**
  - Create individual lender
  - Verify type displays correctly

- [ ] **Fund Lender**
  - Create fund lender
  - Add capital commitment amounts
  - Verify deployed amount ≤ committed

- [ ] **IRA Lender**
  - Create IRA entity type
  - Verify special handling if needed

- [ ] **Validation Tests**
  - Try to create without name (should fail)
  - Try to create without email (should fail)
  - Try invalid email format (should fail)
  - Try negative capital amounts (should fail)

#### Updating Lenders

- [ ] Update lender name
- [ ] Update contact information
- [ ] Increase committed capital
- [ ] Update deployed capital
- [ ] Change entity type
- [ ] Verify utilization % updates correctly

#### Deleting Lenders

- [ ] Delete lender without loan associations
- [ ] Delete lender with loan associations (verify cascade)
- [ ] Verify lender removed from table
- [ ] Verify loan associations removed

### Loan Associations

#### Borrower-Loan Associations

- [ ] **Add Associations**
  - Edit borrower
  - Select one loan from dropdown
  - Verify loan appears as badge
  - Save and verify persistence
  - Refresh page and verify still associated

- [ ] **Multiple Associations**
  - Associate borrower with 3+ loans
  - Verify all show in dropdown with checkmarks
  - Verify all show as badges

- [ ] **Remove Associations**
  - Deselect a loan
  - Verify badge disappears
  - Save and verify change persists

- [ ] **Replace All Associations**
  - Select entirely new set of loans
  - Verify old associations removed
  - Verify new associations added

- [ ] **View Associated Loans**
  - Check loan count in table
  - Verify count matches actual associations

#### Lender-Loan Associations

- [ ] Repeat all borrower-loan association tests for lenders
- [ ] Verify separate from borrower associations (same loan can have different lenders/borrowers)

### Search Functionality

#### Borrower Search

- [ ] **Search by Name**
  - Search for first name (individual)
  - Search for last name (individual)
  - Search for full name
  - Search for entity name
  - Try partial matches ("joh" finds "John")
  - Try case-insensitive search ("JOHN" finds "john")

- [ ] **Search by Email**
  - Search full email
  - Search partial email ("@gmail" finds all Gmail)
  - Try domain search

- [ ] **No Results**
  - Search for non-existent name
  - Verify "no results" message
  - Verify "Clear filters" button appears

#### Lender Search

- [ ] Search by lender name
- [ ] Search by contact email
- [ ] Partial and case-insensitive searches
- [ ] No results handling

### Filtering

#### Borrower Type Filter

- [ ] Filter to "Individual" only
  - Verify only individuals show
  - Check count matches filtered results
- [ ] Filter to "Entity" only
  - Verify only entities show
- [ ] Switch back to "All Types"
  - Verify all borrowers reappear

#### Lender Entity Type Filter

- [ ] Filter each entity type individually:
  - [ ] Individual
  - [ ] Company
  - [ ] Fund
  - [ ] IRA
- [ ] Verify correct records shown for each
- [ ] Switch back to "All Types"

### Combined Search + Filter

- [ ] Search "john" + filter "Individual"
  - Should show only individual borrowers named John
- [ ] Search "@gmail.com" + filter "Entity"
  - Should show only entity borrowers with Gmail
- [ ] Clear filters button resets both search and filter

### Sorting

#### Borrower Sorting

- [ ] **Sort by Name**
  - Click column header
  - Verify A-Z sort
  - Click again for Z-A
  - Verify individuals and entities both sort correctly

- [ ] **Sort by Email**
  - Ascending and descending
  - Verify alphabetical order

- [ ] **Sort by Type**
  - Verify "entity" vs "individual" sort

- [ ] **Sort by Credit Score**
  - Verify numeric sort (not alphabetic)
  - Check null values sort to bottom
  - Ascending and descending

- [ ] **Sort by Loan Count**
  - Verify 0, 1, 2, 3+ sort correctly
  - Numeric sort order

#### Lender Sorting

- [ ] Sort by Name
- [ ] Sort by Entity Type
- [ ] Sort by Email
- [ ] **Sort by Committed Amount**
  - Verify numeric sort
  - Check currency formatting maintained
- [ ] **Sort by Deployed Amount**
  - Verify numeric sort
  - Check percentage calculation maintained
- [ ] Sort by Loan Count

### URL State Persistence

- [ ] **Search Persistence**
  - Enter search term
  - Check URL contains `?search=term`
  - Refresh page
  - Verify search still applied

- [ ] **Filter Persistence**
  - Select type filter
  - Check URL contains `?type=individual`
  - Refresh page
  - Verify filter still applied

- [ ] **Combined Persistence**
  - Apply search + filter
  - Check URL contains both params
  - Copy URL and open in new tab
  - Verify same filtered view

- [ ] **Sharing URLs**
  - Copy filtered URL
  - Share with colleague
  - Verify they see same filtered view

### UI/UX Testing

#### Loading States

- [ ] View skeleton loaders when data loading
- [ ] Verify no flash of wrong content
- [ ] Check loading indicators on buttons

#### Error States

- [ ] Network error handling
- [ ] API error messages display
- [ ] Form validation errors show inline
- [ ] Toast notifications for success/failure

#### Responsive Design

- [ ] Test on mobile viewport (375px)
- [ ] Test on tablet viewport (768px)
- [ ] Test on desktop viewport (1920px)
- [ ] Verify search/filter layout stacks on mobile
- [ ] Check table horizontal scroll on mobile

#### Accessibility

- [ ] Keyboard navigation works
- [ ] Tab order is logical
- [ ] Focus indicators visible
- [ ] Screen reader labels present
- [ ] Color contrast sufficient

### Edge Cases

- [ ] Create borrower with very long name (50+ chars)
- [ ] Create with special characters in name (O'Brien, José, etc.)
- [ ] Create with maximum credit score (850)
- [ ] Create with minimum credit score (300)
- [ ] Associate borrower with 20+ loans
- [ ] Create lender with $0 committed
- [ ] Create lender with very large amount ($1B+)
- [ ] Rapid clicking (double-submit protection)
- [ ] Concurrent edits by multiple users

---

## Unit Test Specifications

### Service Layer Tests

#### BorrowerService Tests

```typescript
describe("BorrowerService", () => {
  describe("getAll", () => {
    it("should return all borrowers for organization", async () => {
      // Test that getAll filters by organizationId
      // Verify correct SQL query is generated
    });

    it("should return empty array when no borrowers exist", async () => {
      // Test edge case of no data
    });
  });

  describe("getById", () => {
    it("should return borrower when found", async () => {
      // Test successful retrieval
    });

    it("should return null when borrower not found", async () => {
      // Test not found case
    });

    it("should return null when borrower belongs to different org", async () => {
      // Test organization isolation
    });
  });

  describe("create", () => {
    it("should create individual borrower with all fields", async () => {
      // Test creation with full data
      // Verify ID is generated
      // Verify timestamps are set
    });

    it("should create entity borrower", async () => {
      // Test entity type creation
    });

    it("should set organizationId from context", async () => {
      // Verify org scoping
    });

    it("should handle optional fields as null", async () => {
      // Test minimal required data
    });
  });

  describe("update", () => {
    it("should update all fields", async () => {
      // Test full update
    });

    it("should update only provided fields", async () => {
      // Test partial update
    });

    it("should not update organizationId", async () => {
      // Security: verify org cannot be changed
    });

    it("should return null when borrower not found", async () => {
      // Test update of non-existent record
    });
  });

  describe("delete", () => {
    it("should delete borrower", async () => {
      // Test successful deletion
    });

    it("should cascade delete loan associations", async () => {
      // Verify relationships removed
    });

    it("should return true when borrower not found", async () => {
      // Idempotent deletion
    });
  });
});
```

#### LenderService Tests

```typescript
describe("LenderService", () => {
  // Similar structure to BorrowerService tests

  describe("create", () => {
    it("should handle numeric string amounts", async () => {
      // Test "5000000.00" converts correctly
    });

    it("should default amounts to 0 when not provided", async () => {
      // Test default values
    });
  });

  describe("update", () => {
    it("should update capital amounts", async () => {
      // Test numeric field updates
    });
  });
});
```

#### RelationshipService Tests

```typescript
describe("RelationshipService", () => {
  describe("syncBorrowerLoans", () => {
    it("should remove all existing associations", async () => {
      // Test that old associations are deleted
    });

    it("should add new associations", async () => {
      // Test new associations created
    });

    it("should handle empty loan array", async () => {
      // Test removing all associations
    });

    it("should be atomic (all or nothing)", async () => {
      // Test transaction rollback on error
    });

    it("should handle duplicate loan IDs", async () => {
      // Test deduplication
    });
  });

  describe("getBorrowerLoans", () => {
    it("should return associated loans", async () => {
      // Test retrieval
    });

    it("should return empty array when no associations", async () => {
      // Test edge case
    });

    it("should only return loans for specified borrower", async () => {
      // Test filtering
    });
  });

  describe("syncLenderLoans", () => {
    // Similar tests to syncBorrowerLoans
  });

  describe("getLenderLoans", () => {
    // Similar tests to getBorrowerLoans
  });
});
```

### Validation Tests

#### Borrower Validation Tests

```typescript
describe("Borrower Validation", () => {
  describe("createBorrowerSchema", () => {
    it("should validate individual borrower", () => {
      const data = {
        type: "individual",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      };
      expect(createBorrowerSchema.parse(data)).toEqual(data);
    });

    it("should reject individual without first name", () => {
      const data = {
        type: "individual",
        lastName: "Doe",
        email: "john@example.com",
      };
      expect(() => createBorrowerSchema.parse(data)).toThrow();
    });

    it("should validate entity borrower", () => {
      const data = {
        type: "entity",
        name: "ABC Corp",
        email: "contact@abc.com",
      };
      expect(createBorrowerSchema.parse(data)).toEqual(data);
    });

    it("should reject invalid email", () => {
      const data = {
        type: "individual",
        firstName: "John",
        lastName: "Doe",
        email: "not-an-email",
      };
      expect(() => createBorrowerSchema.parse(data)).toThrow();
    });

    it("should reject credit score < 300", () => {
      const data = {
        type: "individual",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        creditScore: 250,
      };
      expect(() => createBorrowerSchema.parse(data)).toThrow();
    });

    it("should reject credit score > 850", () => {
      // Similar test for max validation
    });
  });
});
```

#### Lender Validation Tests

```typescript
describe("Lender Validation", () => {
  describe("createLenderSchema", () => {
    it("should validate company lender", () => {
      // Test validation
    });

    it("should accept all entity types", () => {
      // Test each: individual, company, fund, ira
    });

    it("should validate numeric amounts", () => {
      // Test totalCommitted and totalDeployed
    });

    it("should transform string amounts to numbers", () => {
      // Test coercion if implemented
    });
  });
});
```

---

## Integration Test Specifications

### API Route Tests

#### Borrower API Tests

```typescript
describe("Borrower API Routes", () => {
  describe("GET /api/v1/borrowers", () => {
    it("should return 401 without authentication", async () => {
      const response = await fetch("/api/v1/borrowers");
      expect(response.status).toBe(401);
    });

    it("should return all borrowers for authenticated user", async () => {
      // Mock session
      const response = await fetch("/api/v1/borrowers", {
        headers: { Cookie: "session=..." },
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it("should only return borrowers for user's organization", async () => {
      // Test organization isolation
    });
  });

  describe("POST /api/v1/borrowers", () => {
    it("should create borrower with valid data", async () => {
      const body = {
        type: "individual",
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
      };
      const response = await fetch("/api/v1/borrowers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "session=...",
        },
        body: JSON.stringify(body),
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.firstName).toBe("Test");
    });

    it("should return 400 for invalid data", async () => {
      const body = {
        type: "individual",
        email: "test@example.com",
        // Missing required firstName, lastName
      };
      const response = await fetch("/api/v1/borrowers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain("Validation");
    });
  });

  describe("PUT /api/v1/borrowers/:id", () => {
    it("should update borrower", async () => {
      // Test update
    });

    it("should return 404 for non-existent borrower", async () => {
      // Test not found
    });

    it("should return 400 for validation errors", async () => {
      // Test validation
    });
  });

  describe("DELETE /api/v1/borrowers/:id", () => {
    it("should delete borrower", async () => {
      // Test deletion
    });

    it("should cascade delete associations", async () => {
      // Verify relationships removed
    });
  });

  describe("GET /api/v1/borrowers/:id/loans", () => {
    it("should return associated loans", async () => {
      // Test retrieval
    });

    it("should return empty array when no associations", async () => {
      // Test edge case
    });
  });

  describe("PUT /api/v1/borrowers/:id/loans", () => {
    it("should sync loan associations", async () => {
      // Test sync operation
    });

    it("should validate loan IDs", async () => {
      // Test validation
    });
  });
});
```

#### Lender API Tests

```typescript
describe("Lender API Routes", () => {
  // Similar structure to Borrower API tests
  // All CRUD operations
  // Loan association endpoints
});
```

### Database Integration Tests

```typescript
describe("Database Operations", () => {
  describe("Cascade Deletes", () => {
    it("should delete borrower_loans when borrower deleted", async () => {
      // Create borrower
      // Create associations
      // Delete borrower
      // Verify associations gone
    });

    it("should delete lender_loans when lender deleted", async () => {
      // Similar test for lenders
    });

    it("should delete associations when loan deleted", async () => {
      // Test reverse cascade
    });
  });

  describe("Indexes", () => {
    it("should use index for organizationId queries", async () => {
      // Verify query plan uses index
    });

    it("should use index for email searches", async () => {
      // Verify query plan
    });
  });

  describe("Transactions", () => {
    it("should rollback on sync failure", async () => {
      // Test transaction rollback
    });
  });
});
```

---

## UI/E2E Test Specifications

### Playwright Test Examples

```typescript
import { test, expect } from "@playwright/test";

describe("Borrower Management UI", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password");
    await page.click('button[type="submit"]');

    // Navigate to borrowers
    await page.goto("/dashboard/borrowers");
  });

  test("should create new borrower", async ({ page }) => {
    // Click New Borrower button
    await page.click("button:has-text('New Borrower')");

    // Fill form
    await page.selectOption('select[name="type"]', "individual");
    await page.fill('input[name="firstName"]', "John");
    await page.fill('input[name="lastName"]', "Doe");
    await page.fill('input[name="email"]', "john.doe@example.com");

    // Submit
    await page.click("button:has-text('Create Borrower')");

    // Verify success
    await expect(page.locator("text=john.doe@example.com")).toBeVisible();
  });

  test("should search borrowers", async ({ page }) => {
    // Type in search box
    await page.fill('input[placeholder*="Search"]', "John");

    // Verify filtered results
    await expect(page.locator("table tbody tr")).toHaveCount(1);
    await expect(page.locator("text=John Doe")).toBeVisible();
  });

  test("should filter by type", async ({ page }) => {
    // Select filter
    await page.selectOption('select[aria-label="Filter by type"]', "individual");

    // Verify only individuals shown
    const rows = page.locator("table tbody tr");
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const typeCell = rows.nth(i).locator("td:has-text('Individual')");
      await expect(typeCell).toBeVisible();
    }
  });

  test("should sort by name", async ({ page }) => {
    // Click name column header
    await page.click("th:has-text('Name')");

    // Verify ascending sort
    const firstRow = page.locator("table tbody tr").first();
    await expect(firstRow).toContainText(/^A|B/); // Starts with A or B

    // Click again for descending
    await page.click("th:has-text('Name')");

    // Verify descending sort
    await expect(firstRow).toContainText(/^Z|Y/);
  });

  test("should edit borrower", async ({ page }) => {
    // Click actions menu
    await page.click("button[aria-label='Open menu']").first();

    // Click edit
    await page.click("text=Edit borrower");

    // Update field
    await page.fill('input[name="phone"]', "(555) 123-4567");

    // Submit
    await page.click("button:has-text('Update Borrower')");

    // Verify update
    await expect(page.locator("text=(555) 123-4567")).toBeVisible();
  });

  test("should associate loans", async ({ page }) => {
    // Edit borrower
    await page.click("button[aria-label='Open menu']").first();
    await page.click("text=Edit borrower");

    // Scroll to loan associations
    await page.locator("text=Loan Associations").scrollIntoViewIfNeeded();

    // Open dropdown
    await page.click("button:has-text('Select loans')");

    // Select a loan
    await page.click("text=123 Main St").first();

    // Verify badge appears
    await expect(page.locator(".badge:has-text('123 Main St')")).toBeVisible();

    // Close and verify saved
    await page.click("button:has-text('Update Borrower')");

    // Re-open and verify association persisted
    await page.click("button[aria-label='Open menu']").first();
    await page.click("text=Edit borrower");
    await expect(page.locator(".badge:has-text('123 Main St')")).toBeVisible();
  });

  test("should delete borrower", async ({ page }) => {
    // Click actions menu
    await page.click("button[aria-label='Open menu']").first();

    // Click delete
    await page.click("text=Delete");

    // Confirm dialog
    page.on("dialog", (dialog) => dialog.accept());
    await page.click("button:has-text('Delete')");

    // Verify removed
    await expect(page.locator("table tbody tr")).toHaveCount(0);
  });

  test("should persist filters in URL", async ({ page }) => {
    // Apply search
    await page.fill('input[placeholder*="Search"]', "John");

    // Check URL
    await expect(page).toHaveURL(/\?search=John/);

    // Refresh
    await page.reload();

    // Verify filter still applied
    await expect(page.locator('input[placeholder*="Search"]')).toHaveValue(
      "John"
    );
  });
});
```

---

## Test Data Fixtures

### Borrower Fixtures

```typescript
export const borrowerFixtures = {
  individual: {
    type: "individual",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    creditScore: 720,
  },
  individualMinimal: {
    type: "individual",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
  },
  entity: {
    type: "entity",
    name: "ABC Real Estate Holdings LLC",
    email: "contact@abcholdings.com",
    phone: "(555) 987-6543",
    creditScore: 680,
  },
  entityMinimal: {
    type: "entity",
    name: "XYZ Corp",
    email: "info@xyzcorp.com",
  },
  invalidEmail: {
    type: "individual",
    firstName: "Test",
    lastName: "User",
    email: "not-an-email",
  },
  invalidCreditScore: {
    type: "individual",
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    creditScore: 900, // > 850
  },
};
```

### Lender Fixtures

```typescript
export const lenderFixtures = {
  company: {
    name: "ABC Capital Partners",
    entityType: "company",
    contactEmail: "contact@abccapital.com",
    contactPhone: "(555) 111-2222",
    totalCommitted: "5000000.00",
    totalDeployed: "3250000.00",
  },
  fund: {
    name: "XYZ Investment Fund",
    entityType: "fund",
    contactEmail: "investments@xyzfund.com",
    totalCommitted: "10000000.00",
    totalDeployed: "6500000.00",
  },
  individual: {
    name: "Private Lender",
    entityType: "individual",
    contactEmail: "private@lender.com",
  },
  ira: {
    name: "Self-Directed IRA Account",
    entityType: "ira",
    contactEmail: "ira@custodian.com",
    totalCommitted: "250000.00",
    totalDeployed: "150000.00",
  },
  minimal: {
    name: "Minimal Lender",
    entityType: "company",
    contactEmail: "minimal@lender.com",
  },
};
```

### Loan Fixtures

```typescript
export const loanFixtures = {
  active: {
    propertyAddress: "123 Main St, City, State",
    principal: "250000.00",
    status: "active",
  },
  pending: {
    propertyAddress: "456 Oak Ave, Town, State",
    principal: "500000.00",
    status: "pending",
  },
  paidOff: {
    propertyAddress: "789 Pine Rd, Village, State",
    principal: "300000.00",
    status: "paid_off",
  },
};
```

---

## Future Testing Infrastructure

### Recommended Testing Stack

#### Unit Testing
- **Framework**: Vitest
- **Mocking**: Vitest built-in mocks
- **Coverage**: Vitest coverage (c8)

**Setup Example:**

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    coverage: {
      provider: "c8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/**/*.test.ts",
        "src/**/*.test.tsx",
      ],
    },
  },
});
```

#### Integration Testing
- **Framework**: Vitest + Supertest
- **Database**: Test database or transactions with rollback
- **Fixtures**: Factory functions or seed scripts

#### E2E Testing
- **Framework**: Playwright
- **Browser**: Chromium, Firefox, WebKit
- **CI/CD**: GitHub Actions or similar

**Playwright Config Example:**

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 13"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

### Test Database Setup

```typescript
// tests/helpers/database.ts
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

export async function setupTestDatabase() {
  const db = drizzle(process.env.TEST_DATABASE_URL);
  await migrate(db, { migrationsFolder: "./drizzle" });
  return db;
}

export async function seedTestData(db) {
  // Insert test organizations
  // Insert test users
  // Insert test borrowers/lenders
  // Insert test loans
}

export async function clearTestDatabase(db) {
  // Truncate all tables
  // Reset sequences
}
```

### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration
        env:
          TEST_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run src/**/*.test.ts",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "playwright test",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

---

## Test Coverage Goals

### Minimum Coverage Targets

| Layer | Coverage Target |
|-------|----------------|
| Service Layer | 90% |
| Validation Schemas | 100% |
| API Routes | 85% |
| React Hooks | 80% |
| UI Components | 70% |

### Critical Paths (100% Coverage Required)

- Authentication and authorization
- Data validation
- Cascade deletes
- Transaction handling
- Organization isolation

---

## Continuous Testing Strategy

1. **Pre-commit**: Run unit tests via husky
2. **Pull Request**: Run all tests in CI
3. **Staging Deploy**: Run E2E tests
4. **Production Deploy**: Smoke tests
5. **Post-Deploy**: Monitor error rates

---

**Last Updated:** January 2025
**Version:** 2.0
**Module:** Epic E2 - Borrower & Lender Management
