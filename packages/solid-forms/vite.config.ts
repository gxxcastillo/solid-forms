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
  '@gxxc/solid-forms-validation'
];

export default defineConfig({
  plugins: [solid(), dts({ rollupTypes: true, bundledPackages })],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es']
    },
    rollupOptions: {
      external: ['solid-js']
    }
  }
});
