import solid from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [solid()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['@testing-library/jest-dom/vitest'],
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 55,
        functions: 55,
        branches: 50,
        statements: 55
      }
    }
  }
});
