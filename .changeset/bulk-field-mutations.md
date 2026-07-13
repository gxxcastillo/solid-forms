---
'@gxxc/solid-forms': minor
---

Add bulk field-state mutations:

- `setFieldsErrors(errorsByField)`
- `setBlurredFields()`

`reset`, `setValues`, and schema-validation failures now use these bulk paths internally, so large forms update field errors/touched state in one pass instead of one store scan per field. The mutations are public for custom field integrations that need the same bulk-write behavior.
