---
'@gxxc/solid-forms': minor
---

Add `createFields<M>()` and `createForm<M>()` so a form's fields don't need `<M, 'name'>` spelled out
at every call site. Field components (`InputField`, `PasswordField`, `TextAreaField`, `CheckboxField`)
are generic over both the form's value type and each field's own name, but JSX can't carry a type
parameter from `<Form<M>>` down into a sibling field's own generic inference — every element was
checked in isolation. `createFields<M>()` binds `M` once and returns the same components, still typed;
`createForm<M>()` does the same plus binds `Form`, for the common case of one component owning one
form:

```tsx
const { Form, InputField, PasswordField } = createForm<SignupValues>();

<Form onSubmit={(values) => ...}>
  <InputField name='email' label='Email' required />
  <PasswordField name='password' label='Password' required minLength={8} />
</Form>;
```

`createForm` also accepts a Standard Schema instead of a type argument, inferring `M` from the
schema's input type and the bound `Form`'s default submit type from its output type (they can differ
for a transform/coercion schema) — the schema becomes `Form`'s default, so it does not need repeating
as a `schema` prop, mirroring `useForm({ schema })`.

Fixed `FieldInternalProps['match']`'s type: it was `Omit<StringKeyOf<M>, N>`, which does not actually
exclude `N` from the union (`Omit` over a string-literal union resolves against `keyof`, which for
string literals is just the shared `String.prototype` members) and so accepted any string. It is now
`Exclude<StringKeyOf<M>, N>`, correctly rejecting a self-referencing `match` or a name that isn't a
real field — this only takes effect when the field has a bound or explicit `M` (via `createForm`/
`createFields` or `<Field<M, N>>`), since the untyped default (`FieldValueMapping`) still accepts any
string either way.

Exported `FormContextProvider`/`FormContextProviderProps` from the package facade. This lets a
component that always renders its own self-contained `<Form>` still expose live state to an ancestor:
wrap it in `<FormContextProvider store={outer.store}>`, fed by the ancestor's own `useForm()` — the
inner `<Form>` reuses the provided store instead of creating its own, so `outer.state` reflects the
same live values without the component needing to separately export its fields.

Exported `SubmitResponse`/`SubmitResponseMapping` (renamed from the previously-internal
`Response`/`ResponseMapping`) from the package facade — needed to type `createForm`'s bound `Form`.
Renamed rather than exporting the original names as-is, since `Response` at the top level of a form
library's public API collides in spirit with the ubiquitous DOM/Fetch `Response` global.

Removed four dead, unused types from the field-composition surface (`RawFieldValue`, `ElementProps`,
the fields-package `Constraint`, `FormElement`) — none were referenced anywhere, and the fields-package
`Constraint` shadowed an unrelated, actually-used `Constraint` type in the validation package with a
different meaning.
