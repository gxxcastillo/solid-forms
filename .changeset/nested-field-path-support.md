---
'@gxxc/solid-forms': minor
---

`reset(toValues)` and `setValues(values)` now read a dotted/array-index field name (e.g. `items.0.title`) as a path into a nested object, not just a literal flat key — `mutations.setValues({ items: [{ title: 'x' }] })` now sets a field named `items.0.title`. An exact literal key still takes precedence over the nested-path fallback when both are present in the same source object.

Submitted field values (passed to `onSubmit` and to schema validation) are now built by nesting dotted/array-index field names into a real nested object/array, instead of keeping them as flat literal keys — a field named `items.0.title` now submits as `{ items: [{ title }] }`, matching what a nested Standard Schema actually expects, rather than `{ 'items.0.title': ... }`.

Also fixes a latent bug where a field literally named `__proto__` (or another prototype-related name) would have been assigned onto an object's prototype instead of as its own property, in both submitted values and the new nested-path writes; unsafe path segments (`__proto__`, `constructor`, `prototype`) are never descended into.

Flat (non-dotted) field names are completely unaffected. This is groundwork for field arrays — there is still no `FieldArray`/`useFieldArray` primitive, and field names are not yet deep-path typed (a dotted name has to be passed as a plain string today, bypassing the flat `StringKeyOf<M>` type).
