---
'@gxxc/solid-forms': minor
---

The `errors` prop on `Form`/`BaseForm` now actually renders. It was documented (`errors={['Server error']}` — form-level errors to display) but never read, so passing it did nothing. It now renders alongside `form.state.errors` at the end of the form. The prop's TypeScript type is corrected from the never-exported `Record<FieldName, ErrorMessages>` shape to `ErrorMessages` (`string[]`), matching what the docs always said; the unused `FormErrors` type was removed.
