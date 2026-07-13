---
'@gxxc/solid-forms': patch
---

Fix a dev-server-only build error: `Form`'s two TypeScript call-signature overloads (schema vs. no-schema) used to be written as repeated `export function Form(...)` declarations — valid TypeScript, but some build pipelines mis-handle multiple same-named function declarations in one module. Specifically, `vite-plugin-solid`'s HMR transform, under Vite's newer oxc-based TS transform (as used by recent `astro` versions), wrapped the implementation into `const Form = ...` while leaving the bodyless overload signatures as literal, now-colliding `function Form` declarations, producing `Transform failed: Identifier 'Form' has already been declared` whenever a page importing `Form` (directly or transitively) was loaded in dev.

`Form`'s two call signatures now live on a local type, with a single, differently-named implementation cast onto it — identical overload resolution for every caller, but only one real function declaration in the module. Production builds were never affected (this only ever surfaced through a dev server's HMR-aware transform).
