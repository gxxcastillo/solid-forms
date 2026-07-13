---
'@gxxc/solid-forms': minor
---

`reset(toValues)` and `setValues(values)` now understand dotted and array-index field names. For example, `mutations.setValues({ items: [{ title: 'x' }] })` sets a field registered as `items.0.title`. If the source object also contains an exact literal key, the exact key still wins.

Submitted values now nest dotted and array-index field names into real objects and arrays too. A field named `items.0.title` submits as `{ items: [{ title }] }`, matching nested schemas, instead of `{ 'items.0.title': ... }`.

Unsafe path segments such as `__proto__`, `constructor`, and `prototype` are never descended into, preventing prototype-pollution behavior in submitted values or nested writes.

Flat field names are unaffected. Full TypeScript deep-path inference is still tracked separately.
