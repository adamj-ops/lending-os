# Test Helpers

This directory contains reusable test utilities and mock data factories for the analytics testing suite.

## Files

### `analytics-test-data.ts`

Mock data factories for creating test data quickly and consistently.

**Example usage:**

```typescript
import { mockFundSnapshot, mockFundPerformance, generateSnapshotSeries } from '@/tests/helpers/analytics-test-data';

// Create a single mock fund snapshot
const snapshot = mockFundSnapshot({
  snapshotDate: '2025-01-20',
  totalCommitments: '2000000.00',
});

// Create a time series of snapshots
const series = generateSnapshotSeries(
  (date, index) => mockFundSnapshot({
    snapshotDate: date,
    totalCommitments: `${1000000 + index * 100000}.00`
  }),
  30, // 30 days
  new Date('2025-01-01')
);

// Mock fund performance data
const performance = mockFundPerformance({
  fundId: 'custom-fund-id',
  irr: 15.5,
  moic: 1.35,
});
```

### `api-helpers.ts`

Utilities for testing Next.js API routes.

**Example usage:**

```typescript
import {
  createMockRequest,
  createRequestWithParams,
  expectSuccessResponse,
  buildApiUrl
} from '@/tests/helpers/api-helpers';

// Create a simple GET request
const request = createMockRequest('http://localhost:3000/api/v1/analytics/forecast');

// Create a POST request with body
const postRequest = createMockRequest(
  'http://localhost:3000/api/v1/analytics/forecast',
  {
    method: 'POST',
    body: { principal: 100000, rate: 0.05 }
  }
);

// Create a request with query parameters
const requestWithParams = createRequestWithParams(
  'http://localhost:3000/api/v1/loans/analytics',
  {
    start: '2025-01-01',
    end: '2025-01-31',
    loanIds: ['loan-1', 'loan-2']
  }
);

// Assert successful response
const data = await expectSuccessResponse(response, 200);

// Build URL with query params
const url = buildApiUrl('/api/v1/loans/analytics', {
  start: '2025-01-01',
  end: '2025-01-31'
});
```

## Benefits

1. **Consistency**: All tests use the same mock data structure
2. **Maintainability**: Update mock data in one place
3. **Readability**: Tests are more concise and focused on behavior
4. **Type Safety**: TypeScript ensures correct data shapes
5. **Reusability**: Share utilities across multiple test files

## Adding New Helpers

When adding new test helpers:

1. Keep them generic and reusable
2. Add TypeScript types for better IDE support
3. Include JSDoc comments for documentation
4. Add examples to this README
5. Follow the existing naming conventions

## Best Practices

1. **Use factories for complex objects**: Instead of creating mock objects inline, use factory functions
2. **Override only what you need**: Factories should provide sensible defaults
3. **Generate realistic data**: Mock data should be representative of production data
4. **Keep helpers pure**: Avoid side effects in helper functions
5. **Test the helpers**: Complex helpers should have their own tests
