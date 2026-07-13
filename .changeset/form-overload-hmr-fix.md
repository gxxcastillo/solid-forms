---
'@gxxc/solid-forms': patch
---

Fix a dev-server-only build error in some Vite/Solid pipelines:

```txt
Transform failed: Identifier 'Form' has already been declared
```

`Form` keeps the same public call signatures, but its implementation no longer relies on repeated same-named TypeScript overload declarations. This makes HMR transforms that do not fully strip overload signatures before wrapping components behave correctly. Production builds were not affected.
