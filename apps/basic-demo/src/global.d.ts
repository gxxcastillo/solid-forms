/// <reference types="@solidjs/start/env" />

// The demo's tsconfig doesn't pull in `vite/client`, so declare the CSS-module
// shape used by ThemeShowcase here. Plain `.css` side-effect imports (theme
// files) resolve to `any`.
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.css';
