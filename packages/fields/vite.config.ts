import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import solid from 'vite-plugin-solid';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [solid(), dts()],
  build: {
    minify: false,
    sourcemap: true,
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: false
      },
      mangle: false
    },
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es']
    },
    rollupOptions: {
      external: ['solid-js']
    }
  }
});
