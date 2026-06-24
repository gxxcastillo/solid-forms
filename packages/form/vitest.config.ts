import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 65,
        functions: 65,
        branches: 60,
        statements: 65
      }
    }
  }
});
