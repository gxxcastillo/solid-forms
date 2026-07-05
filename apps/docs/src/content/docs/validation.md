---
title: Validation
description: Use built-in constraints and custom validators.
---

Constraints are declared as field props. Errors appear after the user has blurred a field or submitted
the form.

```tsx
<InputField
  name='username'
  label='Username'
  required
  minLength={3}
  maxLength={20}
  pattern={/^[a-z0-9_]+$/}
/>

<InputField name='age' label='Age' min={18} max={120} />

<InputField name='confirm' label='Confirm password' match='password' />
```

| Constraint | Type | Description |
| --- | --- | --- |
| `required` | `boolean` | Field must have a non-empty value |
| `minLength` | `number` | Minimum string length |
| `maxLength` | `number` | Maximum string length |
| `min` | `number` | Minimum numeric value, parsed with the field `parse` prop |
| `max` | `number` | Maximum numeric value, parsed with the field `parse` prop |
| `pattern` | `string \| RegExp` | Value must match the pattern |
| `match` | `string` | Value must equal the named field's current value |

Set a constraint prop to `false` to disable that constraint entirely, for example
`required={false}`.

## Custom validators

Use a `validator` function for logic that built-in constraints cannot express. Custom validators run
only when no built-in errors exist on the field.

```tsx
<InputField
  name='username'
  label='Username'
  validator={async (name, value, formState, setErrors) => {
    const taken = await api.checkUsername(value as string);
    if (taken) {
      setErrors(['Username is already taken']);
    }
  }}
/>
```

The validator signature is:

```ts
type CustomValidator<M, N extends keyof M> = (
  fieldName: N,
  fieldValue: M[N],
  formState: FormState<M>,
  setFieldErrors: (errors: string[]) => void
) => void | Promise<void>;
```

Sync validators call `setErrors` before returning. Async validators call `setErrors` when the promise
resolves.
