---
'@gxxc/solid-forms': minor
---

Fields now unregister from form state when they unmount instead of leaving stale entries behind.

Conditionally rendered fields, wizard steps, and accordion sections no longer keep counting toward `isFormValid`, `haveValuesChanged`, or submitted values after they leave the DOM. Re-mounted fields start fresh, matching fields that have never mounted before.

Adds a `removeField` mutation to `FormStateMutations`.
