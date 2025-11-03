# E2E Tests for Lending OS

## Overview

This directory contains end-to-end (E2E) tests for the Lending OS application using Playwright. The tests cover critical user flows, security boundaries, and feature functionality.

## Test Structure

### Test Files

- **`smoke-public.spec.ts`** - Public routes and unauthenticated API tests
- **`smoke-authenticated.spec.ts`** - Basic authenticated dashboard navigation
- **`analytics-features.spec.ts`** - Analytics features (filters, drill-down, exports)
- **`loan-wizard.spec.ts`** - Loan creation wizard and detail pages
- **`security.spec.ts`** - Security boundaries (auth, IDOR, XSS, CSRF)
- **`auth.setup.ts`** - Authentication setup for reusable sessions

### Test Coverage

#### ✅ Implemented (Public Routes)
- Login page renders
- Register page renders  
- Unauthorized page renders
- API endpoints require authentication

#### 🚧 Scaffolded (Needs Implementation)
- Authenticated dashboard navigation
- Loan wizard complete flow
- Analytics filters and drill-down
- Security (IDOR, XSS, portal access)
- Data exports
- Form validation

## Running Tests

### Run All Tests
```bash
npx playwright test
```

### Run Specific Test File
```bash
npx playwright test tests/e2e/smoke-public.spec.ts
```

### Run Tests in UI Mode
```bash
npx playwright test --ui
```

### Run Tests in Debug Mode
```bash
npx playwright test --debug
```

### Generate Test Report
```bash
npx playwright show-report
```

## Authentication Setup

The `auth.setup.ts` file handles authentication for tests that require logged-in users.

### Environment Variables

Create a `.env.test` file with test credentials:

```bash
TEST_USER_EMAIL=ops@test.com
TEST_USER_PASSWORD=TestPassword123!

TEST_INVESTOR_EMAIL=investor@test.com
TEST_INVESTOR_PASSWORD=TestPassword123!

TEST_BORROWER_EMAIL=borrower@test.com
TEST_BORROWER_PASSWORD=TestPassword123!
```

### Storage State

Authentication state is saved to `tests/.auth/`:
- `user.json` - Ops user session
- `investor.json` - Investor user session
- `borrower.json` - Borrower user session

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/your-page');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await page.getByRole('button', { name: 'Click Me' }).click();
    
    // Act
    const result = page.getByText('Result');
    
    // Assert
    await expect(result).toBeVisible();
  });
});
```

### Using Authentication

```typescript
// In playwright.config.ts, configure project to use storage state:
{
  name: 'authenticated',
  dependencies: ['setup'],
  use: { storageState: 'tests/.auth/user.json' }
}

// Then tests in that project will be automatically authenticated
test('authenticated test', async ({ page }) => {
  await page.goto('/dashboard');
  // Already logged in!
});
```

### Best Practices

1. **Use Role-Based Selectors**: Prefer `getByRole`, `getByLabel`, `getByText` over CSS selectors
2. **Wait for Navigation**: Use `page.waitForURL()` after actions that navigate
3. **Explicit Assertions**: Always use `expect()` assertions
4. **Test Isolation**: Each test should be independent and not rely on other tests
5. **Page Object Pattern**: For complex pages, consider using Page Object Model
6. **Data-TestId**: Add `data-testid` attributes for stable test selectors
7. **Skip Appropriately**: Use `test.skip()` for tests that require specific conditions

## Test Data

### Creating Test Data

For tests that require specific data:

1. Use API calls in `beforeEach` to set up test data
2. Use database seeds for consistent test data
3. Clean up test data in `afterEach` hooks

```typescript
test.beforeEach(async ({ request }) => {
  // Create test loan
  await request.post('/api/v1/loans', {
    data: { /* loan data */ }
  });
});

test.afterEach(async ({ request }) => {
  // Clean up test data
  await request.delete('/api/v1/loans/test-loan-id');
});
```

## CI/CD Integration

Tests run automatically in CI/CD:

```yaml
# .github/workflows/e2e-tests.yml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E Tests
  run: npx playwright test
  
- name: Upload Test Results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Debugging Failed Tests

### View Last Test Run
```bash
npx playwright show-report
```

### Re-run Failed Tests
```bash
npx playwright test --last-failed
```

### View Traces
```bash
npx playwright show-trace trace.zip
```

### Screenshots
Failed tests automatically save screenshots to `test-results/`.

## Coverage Goals

### Phase 1-15 (Core Features)
- [ ] Authentication flows (login, register, verify email)
- [ ] Dashboard navigation
- [ ] Loan CRUD operations
- [ ] Borrower management
- [ ] Lender management
- [ ] Fund management
- [ ] Analytics pages

### Phase 16-24 (Security & Advanced)
- [ ] Multi-tenant isolation
- [ ] IDOR prevention
- [ ] XSS protection
- [ ] Portal access control
- [ ] Data lifecycle

### Phase 25-31 (Performance & Polish)
- [ ] Mobile/responsive design
- [ ] Accessibility (WCAG compliance)
- [ ] Performance budgets
- [ ] Error handling
- [ ] Edge cases

## Maintenance

### Updating Tests
When UI changes:
1. Update selectors in affected tests
2. Re-record tests if using Playwright Codegen
3. Update snapshots if using visual regression

### Adding New Features
When adding new features:
1. Write tests before or alongside implementation
2. Follow existing test patterns
3. Update this README with new test coverage

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors Guide](https://playwright.dev/docs/selectors)
- [Test Retry & Timeouts](https://playwright.dev/docs/test-timeouts)

