---
'@gxxc/solid-forms': patch
---

Validation error messages now use a field's configured `label` instead of its raw `name`, so e.g. a `PasswordField` named `confirm` with `label="Confirm password"` reports `"Confirm password" is required` instead of `"confirm" is required`. The `match` constraint resolves the matched field's label the same way (`"Confirm password" does not match "Password"`). Fields without a `label` fall back to their `name`, unchanged from before.
