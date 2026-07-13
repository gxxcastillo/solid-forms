---
'@gxxc/solid-forms': minor
---

Add `setFieldsErrors`/`setBlurredFields` bulk mutations to `FormStateMutations`, and switch `reset`, `setValues`, and failed-schema-submit handling to use them internally instead of one per-field store mutation per field. Previously each of these issued one `O(n)` linear-scan store write per field (`reset`/`setValues` via `setFieldErrors`/`setBlurredField`-shaped per-field writes, a failed schema submit via the same), making the whole operation `O(n²)` in field count; now each does a single `fields.map()` pass instead. Exposed as public mutations since the same bulk-write shape is generally useful, not just for the library's own internal call sites.
