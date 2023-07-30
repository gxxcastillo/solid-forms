import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'state',
      formats: ['es']
    },
    rollupOptions: {
      external: ['solid-js']
    }
  }
});
