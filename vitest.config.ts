import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),           // MUST be first for JSX/TSX transformation
  ],
  
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      'node_modules',
      'dist',
      'build',
      'tests/e2e/**',  // Playwright tests run separately
      '.next',
      '.storybook',
      'src/**/*.stories.{ts,tsx}',  // Exclude story files from regular tests
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/**/*.stories.{ts,tsx}',
        'src/types/**',
        'src/db/migrations/**',
        'src/**/__tests__/**',
        'src/**/__mocks__/**',
      ],
      // No thresholds - just enable collection for visibility
      // Can add reasonable thresholds later (e.g., 50-60% baseline)
    },
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});