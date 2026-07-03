import { defineConfig } from '@solidjs/start/config';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  ssr: false,
  vite: {
    resolve: {
      alias: {
        '@gxxc/solid-forms': resolve(__dirname, '../../packages/solid-forms/src/index.ts')
      }
    },
    build: {
      sourcemap: true
    }
  }
});
