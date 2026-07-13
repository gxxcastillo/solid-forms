---
'@gxxc/solid-forms': minor
---

Add typed factories that bind a form's value type once instead of repeating it on every field:

- `createFields<M>()` returns typed field components.
- `createForm<M>()` returns a typed `Form` plus typed field components.

```tsx
const { Form, InputField, PasswordField } = createForm<SignupValues>();

<Form onSubmit={(values) => ...}>
  <InputField name='email' label='Email' required />
  <PasswordField name='password' label='Password' required minLength={8} />
</Form>;
```

`createForm` also accepts a Standard Schema instead of a type argument. It infers field state from the schema input type and submit values from the schema output type, and the schema becomes the bound `Form`'s default.

Also:

- Fixed `match` typing so a bound field cannot match itself or a non-existent sibling field.
- Exported `FormContextProvider` and `FormContextProviderProps` from the facade for shared-store composition.
- Exported `SubmitResponse` and `SubmitResponseMapping` for typed submit-handler maps.
- Removed unused field-composition types from the public type surface.
