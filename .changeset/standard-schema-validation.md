---
'@gxxc/solid-forms': minor
---

Add Standard Schema validation support to `Form` and `useForm`.

Pass `schema` to `<Form schema={schema}>` or `useForm({ schema })` to validate submitted field values with any Standard Schema-compatible library. Field-path issues are mapped back to registered fields, pathless or unregistered issues surface as form-level errors, and successful schema output is passed to `onSubmit`.

Schema-backed forms infer field state from schema input and submit values from schema output, so transform/coercion schemas keep pre-submit state and `onSubmit` correctly typed. Consumers no longer need to hand-write a form values generic or add an index signature just to satisfy the library. Explicit form value interfaces without index signatures are also accepted across the form, field, validation, and state APIs.
