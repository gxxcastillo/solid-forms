---
'@gxxc/solid-forms': minor
---

Fields now unregister from form state when they unmount, instead of leaving a stale entry behind. Previously a conditionally-rendered field (an accordion section, a wizard step, a toggled block) kept counting toward `isFormValid`, `haveValuesChanged`, and the submitted values forever, even after it left the DOM. A field that re-mounts starts fresh, matching how a never-before-seen field already behaved. Adds a `removeField` mutation to `FormStateMutations`.
