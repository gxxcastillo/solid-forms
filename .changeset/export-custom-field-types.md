---
'@gxxc/solid-forms': minor
---

Export `FormFieldProps`, `CustomValidator`, `ParseFunction`, and `FormatFunction` (plus the rest of the field-composition types) from the package. These were used throughout the field components' own typings and the custom-fields docs already told users to `import type { FormFieldProps } from '@gxxc/solid-forms'`, but nothing re-exported them, so that import — and any hand-written custom field wrapping `createFormField` — failed to resolve.
