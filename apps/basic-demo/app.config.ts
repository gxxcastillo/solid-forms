import { defineConfig } from '@solidjs/start/config';

export default defineConfig({
  ssr: false,
  vite: {
    build: {
      sourcemap: true
    }
  }
});
