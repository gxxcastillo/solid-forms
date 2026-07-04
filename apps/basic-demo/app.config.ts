import { defineConfig } from '@solidjs/start/config';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  ssr: false,
  server: {
    // Set to '/solid-forms/' in CI when deploying to GitHub Pages;
    // defaults to root so local dev/build are unaffected.
    baseURL: process.env.VITE_BASE_PATH ?? '/'
  },
  vite: {
    resolve: {
      alias: {
        // More specific entry first: theme CSS lives as standalone files, while
        // the bare package points at source for live-editing in dev.
        '@gxxc/solid-forms/themes': resolve(__dirname, '../../packages/solid-forms/themes'),
        '@gxxc/solid-forms': resolve(__dirname, '../../packages/solid-forms/src/index.ts')
      }
    },
    build: {
      sourcemap: true
    }
  }
});
