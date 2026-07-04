/// <reference types="@solidjs/start/env" />

// `vinxi/client`'s package.json "types" condition resolves to an empty stub (its
// real `ImportMeta` augmentation lives in a file that export map doesn't expose),
// so declare the merge ourselves. `ImportMetaEnv` itself still comes from the
// `@solidjs/start/env` reference above.
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// The demo's tsconfig doesn't pull in `vite/client`, so declare the CSS-module
// shape used by ThemeShowcase here. Plain `.css` side-effect imports (theme
// files) resolve to `any`.
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.css';
