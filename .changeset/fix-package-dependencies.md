---
"@gxxc/solid-forms": patch
---

Fix packaging so internal workspace packages are not listed as runtime dependencies of the published package. The build bundles all internal packages into dist/index.js; the publish script now documents this and strips them before running changeset publish.
