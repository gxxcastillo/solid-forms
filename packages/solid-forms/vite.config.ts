import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import solid from 'vite-plugin-solid';

const __dirname = dirname(fileURLToPath(import.meta.url));

const bundledPackages = [
  '@gxxc/solid-forms-elements',
  '@gxxc/solid-forms-fields',
  '@gxxc/solid-forms-form',
  '@gxxc/solid-forms-state',
  '@gxxc/solid-forms-validation',
  'type-fest'
];

export default defineConfig({
  plugins: [solid(), dts({ rollupTypes: true, bundledPackages })],
  build: {
    minify: false,
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: false
      },
      mangle: false
    },
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      external: ['solid-js']
    }
  }
});
