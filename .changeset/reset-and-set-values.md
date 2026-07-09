---
'@gxxc/solid-forms': minor
---

Add `resetField`, `reset`, and `setValues` mutations for reverting or bulk-updating form state.

`resetField(name)` reverts one field to its initial value and clears its errors. `reset(toValues?)` reverts every registered field to its initial value and clears form-level errors — pass `toValues` to rebaseline specific fields to new values instead (the "load these values, then let the user edit" case), so a later revert goes back to that new baseline rather than the original mount-time default. `setValues(values)` bulk-sets current values for already-registered fields without touching their initial-value baseline, for programmatic updates that should still count as user-editable "changed" state.

All three are accessed the same way as the existing per-field mutations, e.g. `const [state, mutations] = useForm().store; mutations.reset();`. They only affect fields that are currently mounted; keys for unregistered field names are ignored.

Resetting or bulk-setting a field's value while one of its async custom validators is still in flight now correctly discards that validator's result instead of letting it clobber the field after the fact.

`resetField`/`reset` clear a field's errors without checking them against its constraints or custom validator — the state layer that implements them has no access to either. A mounted field now automatically re-validates itself right after a reset, so `isFormValid` reflects the reverted-to value's actual validity instead of appearing clean just because its errors were cleared. `setValues` is unaffected: it keeps deliberately preserving whatever errors were already there.
