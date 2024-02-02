import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid(), dts()],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'solid-forms',
      formats: ['es']
    },
    rollupOptions: {
      external: ['solid-js']
    }
  }
});
