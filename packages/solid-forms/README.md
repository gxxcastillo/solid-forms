# @gxxc/solid-forms

Typed, reactive forms for [SolidJS](https://www.solidjs.com/).

## Installation

```bash
npm install @gxxc/solid-forms
# or
pnpm add @gxxc/solid-forms
```

Requires SolidJS 1.x as a peer dependency.

---

## Quick start

The simplest form needs no type parameters. Import `Form`, add fields, and provide an `onSubmit` handler.

```tsx
import { Form, InputField, PasswordField, SubmitButton } from '@gxxc/solid-forms';

function LoginForm() {
  return (
    <Form onSubmit={(values) => console.log(values)}>
      <InputField name="email" label="Email" required />
      <PasswordField name="password" label="Password" required minLength={8} />
      <SubmitButton>Log in</SubmitButton>
    </Form>
  );
}
```

---

## Typed form with `useForm`

Pass your field shape as a type parameter to get fully typed `onSubmit` values and reactive state access outside the form tree.

> **TypeScript note:** The type parameter must satisfy `Record<string, unknown>`. Add an index signature (`[key: string]: unknown`) to any interface you pass, or use a `type` alias that widens to a record.

```tsx
import { useForm, InputField, PasswordField, SubmitButton } from '@gxxc/solid-forms';

// Add an index signature so TypeScript accepts the type as a FieldValueMapping.
interface LoginValues {
  [key: string]: string;
  email: string;
  password: string;
}

function LoginForm() {
  const form = useForm<LoginValues>();

  // Read reactive field state anywhere in this component tree:
  // form.state.getFieldValue('email')
  // form.state.isFormValid

  async function onSubmit(values: LoginValues) {
    await api.login(values);
    // form.state.isProcessing is true during this await
  }

  return (
    <form.Form onSubmit={onSubmit}>
      <InputField name="email" label="Email" required />
      <PasswordField name="password" label="Password" required minLength={8} />
      <SubmitButton>Log in</SubmitButton>
    </form.Form>
  );
}
```

---

## Validation

Built-in constraints are declared as props on each field. Errors appear after the user has either blurred the field or submitted the form.

```tsx
<InputField name="username" label="Username"
  required
  minLength={3}
  maxLength={20}
  pattern={/^[a-z0-9_]+$/}
/>

<InputField name="age" label="Age"
  min={18}
  max={120}
/>

<InputField name="confirm" label="Confirm password"
  match="password"
/>
```

| Constraint  | Type              | Description                                        |
|-------------|-------------------|----------------------------------------------------|
| `required`  | `boolean`         | Field must have a non-empty value                  |
| `minLength` | `number`          | Minimum string length                              |
| `maxLength` | `number`          | Maximum string length                              |
| `min`       | `number`          | Minimum numeric value (parsed with `parse` prop)   |
| `max`       | `number`          | Maximum numeric value                              |
| `pattern`   | `string \| RegExp`| Value must match the pattern                       |
| `match`     | `string`          | Value must equal the named field's current value   |

Setting a constraint prop to `false` (e.g. `required={false}`) disables that constraint entirely.

### Custom validators

Supply a `validator` function for logic that built-in constraints cannot express. Custom validators run only when no built-in errors exist on the field.

```tsx
<InputField
  name="username"
  label="Username"
  validator={async (name, value, formState, setErrors) => {
    const taken = await api.checkUsername(value as string);
    if (taken) {
      setErrors(['Username is already taken']);
    }
  }}
/>
```

The `validator` signature:

```ts
type CustomValidator<M, N extends keyof M> = (
  fieldName: N,
  fieldValue: M[N],
  formState: FormState<M>,
  setFieldErrors: (errors: string[]) => void
) => void | Promise<void>;
```

Sync validators call `setErrors` before returning. Async validators call `setErrors` when the promise resolves.

---

## Async submission

Return a Promise from `onSubmit`. The form sets `isProcessing` to `true` for the duration and disables the submit button automatically. If the handler throws, `isProcessing` is reset to `false` (via a `finally`) and the rejection propagates out of the handler — the form logs it to the console but does **not** add it to `form.state.errors`. Catch the error inside your handler and surface it yourself (e.g. through the `errors` prop) if you want it shown in the UI.

```tsx
async function onSubmit(values: LoginValues) {
  const response = await api.login(values);
  if (!response.ok) {
    throw new Error('Invalid credentials');
  }
}
```

---

## Custom parse and format

By default, field values are strings (what the DOM gives you). Supply `parse` and `format` to work with richer types.

```tsx
<InputField<{ age: number }, 'age'>
  name="age"
  label="Age"
  parse={(raw) => parseInt(raw ?? '', 10)}
  format={(val) => (val != null ? String(val) : '')}
  min={0}
  max={150}
/>
```

- `parse` converts the raw string from the DOM into your typed value before it is written to form state.
- `format` converts the typed value back to a string for display in the input.

---

## Custom fields

Wrap `createFormField` to integrate any input element into the form.

```tsx
import { createFormField } from '@gxxc/solid-forms';
import type { FormFieldProps, FieldValueMapping } from '@gxxc/solid-forms';
import { type StringKeyOf } from 'type-fest';

function RatingField<M extends FieldValueMapping, N extends StringKeyOf<M>>(
  props: FormFieldProps<'input', M, N>
) {
  const [fieldProps, createField] = createFormField<'input', M, N>(props)();
  return createField('InputField', (
    <div>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          onClick={() => fieldProps.setValue(n as M[N])}
        >
          {n}
        </button>
      ))}
      {fieldProps.errors?.[0] && <div>{fieldProps.errors[0]}</div>}
    </div>
  ));
}
```

---

## API reference

### `useForm<M, R>()`

Creates a self-contained form store. Returns:

| Property | Type | Description |
|----------|------|-------------|
| `Form`   | Component | Renders the `<form>` element; accepts the same props as [`Form`](#form) |
| `state`  | `FormState<M>` | Reactive state object (see [State API](#state-api)) |
| `store`  | `FormStore<M>` | Raw `[state, mutations]` tuple |

Use `useForm` when you need to read field values or validity outside the form tree. Use [`Form`](#form) directly when you only need a submit handler.

---

### `Form`

A self-contained form that creates its own internal store.

```tsx
<Form<LoginValues>
  onSubmit={handleSubmit}
  errors={['Server error']}
  isLoading={isPageLoading}
>
  ...
</Form>
```

| Prop | Type | Description |
|------|------|-------------|
| `onSubmit` | `(values: M) => void \| Promise<void>` | Submit handler |
| `children` | `JSX.Element` | Field components and submit buttons |
| `errors` | `string[]` | Form-level errors to display |
| `isLoading` | `boolean` | Disables all fields while loading |
| `isProcessing` | `boolean` | Controlled override for the processing state |
| `className` | `string` | CSS class on the `<form>` element |
| `align` | `'left' \| 'center'` | Button alignment (default `'left'`) |
| `fullWidthButtons` | `boolean` | Stretch buttons to full width |

---

### `InputField`

Renders a labeled `<input type="text">`.

```tsx
<InputField<M, 'email'>
  name="email"
  label="Email address"
  defaultValue="user@example.com"
  required
  pattern={/^[^@]+@[^@]+$/}
/>
```

| Prop | Type | Description |
|------|------|-------------|
| `name` | `StringKeyOf<M>` | Field name — must match a key in the form's value type |
| `label` | `string` | Visible label text |
| `defaultValue` | `M[N]` | Initial value |
| `disabled` | `boolean` | Disables the input |
| `readonly` | `boolean` | Makes the input read-only |
| `parse` | `(raw: string) => M[N]` | Convert DOM string to typed value |
| `format` | `(val: M[N]) => string` | Convert typed value back to display string |
| `validator` | `CustomValidator<M, N>` | Custom validation function |
| `required` `minLength` `maxLength` `pattern` `min` `max` `match` | | Validation constraints (see table above) |

All standard HTML `<input>` attributes are also accepted.

---

### `PasswordField`

Same props as `InputField`. Renders `<input type="password">`.

---

### `TextAreaField`

Same props as `InputField` (except `type`). Renders a `<textarea>`.

```tsx
<TextAreaField name="bio" label="Bio" maxLength={500} />
```

---

### `CheckboxField`

Renders a labeled checkbox. The field value in form state is a `boolean`.

```tsx
<CheckboxField name="acceptTerms" label="I accept the terms" required />
```

| Prop | Type | Description |
|------|------|-------------|
| `name` | `StringKeyOf<M>` | Field name |
| `label` | `string` | Label text |
| `defaultChecked` | `boolean` | Initial checked state |
| `disabled` | `boolean` | Disables the checkbox |
| `required` | `boolean` | Field must be `true` to be valid |
| `validator` | `CustomValidator<M, N>` | Custom validation function |

---

### `SubmitButton`

Renders a submit button. Disabled automatically when the form has validation errors.

```tsx
<SubmitButton>Log in</SubmitButton>

{/* Named submit buttons — each distinct name selects a handler from an
    object-style onSubmit map: onSubmit={{ saveDraft, publish }} */}
<SubmitButton name="saveDraft">Save draft</SubmitButton>
<SubmitButton name="publish">Publish</SubmitButton>
```

| Prop | Type | Description |
|------|------|-------------|
| `children` | `JSX.Element` | Button label |
| `isDisabled` | `boolean` | Override disable state |
| `isFullWidth` | `boolean` | Stretch to container width |
| `name` | `string` | Optional field name for multi-button forms |
| `type` | `'primary' \| 'approve'` | Visual variant (`'approve'` renders `type="button"`) |

---

### State API

`form.state` is a reactive object. Access it inside Solid signals, `createEffect`, or JSX to get fine-grained updates.

| Property / Method | Type | Description |
|-------------------|------|-------------|
| `isFormValid` | `boolean` | `true` when no registered field has errors |
| `haveValuesChanged` | `boolean` | `true` when any field has changed from its initial value |
| `isLoading` | `boolean` | Form is in a loading state |
| `isProcessing` | `boolean` | Async submit handler is in flight |
| `errors` | `string[]` | Form-level errors |
| `getFieldValue(name)` | `M[N] \| undefined` | Current parsed value for a field |
| `getFieldErrors(name)` | `string[] \| undefined` | Current errors for a field |
| `isFieldValid(name)` | `boolean \| undefined` | `false` if field has errors; `undefined` if not yet registered |
| `hasFieldBeenValid(name)` | `boolean \| undefined` | `true` once the field has been error-free at any point |
| `hasFieldBlurred(name)` | `boolean \| undefined` | `true` once the user has blurred the field |
| `hasFieldChanged(name)` | `boolean \| undefined` | `true` once the field value has changed |
| `hasFieldBeenInitialized(name)` | `boolean` | `true` once the field has registered with the store |

---

## Solid vs React mental model

If you are coming from React forms (React Hook Form, Formik), a few patterns are intentionally different:

**No `register()` calls.** Fields self-register when they mount. You do not call a `register` function or spread a ref object onto inputs.

**Controlled by default, Solid-reactive.** Fields read their value from the store through Solid's fine-grained reactive system. The `value` prop passed to an `<input>` is a getter, not a snapshot — no `watch()` or subscription setup needed.

**No `watch()` or subscription API.** Access `form.state.getFieldValue('email')` directly in JSX. Solid tracks the dependency automatically and re-renders only the component that reads it.

**`parse` and `format` instead of `valueAs`.** Rather than `{ valueAsNumber: true }` on the input, provide `parse` to convert incoming strings into the right type and `format` to convert back. This keeps the type contract explicit in TypeScript.

**Validation runs on input, not on submit only.** Errors are computed on every keystroke (and on blur). They become *visible* after the user has blurred the field or the form has been submitted once. You do not need to call `trigger()` manually.
