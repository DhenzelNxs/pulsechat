import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['./tests/env.setup.ts', './tests/setup.ts'],
    testTimeout: 30000,
    fileParallelism: false,
  },
});
