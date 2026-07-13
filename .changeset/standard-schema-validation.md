---
'@gxxc/solid-forms': minor
---

Add Standard Schema validation support to `Form` and `useForm`.

Pass `schema` to `<Form schema={schema}>` or `useForm({ schema })` to validate submitted values with any Standard Schema-compatible library.

- Field-path issues are mapped back to registered fields.
- Pathless or unregistered issues surface as form-level errors.
- Successful schema output is passed to `onSubmit`.
- Schema-backed forms infer field state from schema input and submit values from schema output, so transform/coercion schemas stay correctly typed.

Plain form value interfaces no longer need index signatures just to satisfy the library.
