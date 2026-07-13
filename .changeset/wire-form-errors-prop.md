---
'@gxxc/solid-forms': minor
---

The `errors` prop on `Form`/`BaseForm` now renders alongside `form.state.errors`.

The prop is typed as `ErrorMessages` (`string[]`), matching the documented `errors={['Server error']}` usage. The unused `FormErrors` type was removed.
