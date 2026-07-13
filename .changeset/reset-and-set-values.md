---
'@gxxc/solid-forms': minor
---

Add `resetField`, `reset`, and `setValues` mutations for reverting or bulk-updating form state.

- `resetField(name)` reverts one field to its initial value and clears its errors.
- `reset(toValues?)` reverts every registered field to its initial value and clears form-level errors. Passing `toValues` also rebaselines those fields for future resets.
- `setValues(values)` bulk-sets current values for already-registered fields without changing their reset baseline.

All three are available through the existing mutation API:

```ts
const [, mutations] = useForm().store;
mutations.reset();
```

Keys for unregistered fields are ignored. Resetting or bulk-setting a field while an async custom validator is in flight now discards the stale validator result. Mounted fields revalidate after `reset`/`resetField`, so `isFormValid` reflects the reverted values instead of just the cleared errors.
