import { afterEach, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

afterEach(() => {
  cleanup();
});

// Note: Router mocks should be done inline per-test if needed
// Example: vi.mock('next/navigation', () => ({ useRouter: vi.fn() }))
// Avoid global mocks to prevent conflicts with API route tests

