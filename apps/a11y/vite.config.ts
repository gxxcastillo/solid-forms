import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: [
      {
        find: '@gxxc/solid-forms/styles.css',
        replacement: resolve(__dirname, '../../packages/solid-forms/src/index.ts')
      },
      {
        find: '@gxxc/solid-forms/themes',
        replacement: resolve(__dirname, '../../packages/solid-forms/themes')
      },
      {
        find: '@gxxc/solid-forms-examples',
        replacement: resolve(__dirname, '../../packages/examples/src/index.ts')
      },
      {
        find: '@gxxc/solid-forms',
        replacement: resolve(__dirname, '../../packages/solid-forms/src/index.ts')
      }
    ]
  }
});
