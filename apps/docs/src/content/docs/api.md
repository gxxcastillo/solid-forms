---
title: API reference
description: Reference for form hooks, field components, and state APIs.
---

## `useForm<M, R>()`

Creates a self-contained form store.

| Property | Type | Description |
| --- | --- | --- |
| `Form` | Component | Renders the form element; accepts the same props as `Form` |
| `state` | `FormState<M>` | Reactive state object |
| `store` | `FormStore<M>` | Raw `[state, mutations]` tuple |

Use `useForm` when you need to read field values or validity outside the form tree. Use `Form`
directly when you only need a submit handler.

## `Form`

A self-contained form that creates its own internal store.

```tsx
<Form<LoginValues> onSubmit={handleSubmit} errors={['Server error']} isLoading={isPageLoading}>
  {/* fields */}
</Form>
```

| Prop | Type | Description |
| --- | --- | --- |
| `onSubmit` | `(values: M) => void \| Promise<void>` | Submit handler |
| `children` | `JSX.Element` | Field components and submit buttons |
| `errors` | `string[]` | Form-level errors to display |
| `isLoading` | `boolean` | Disables all fields while loading |
| `isProcessing` | `boolean` | Controlled override for processing state |
| `className` | `string` | CSS class on the form element |
| `align` | `'left' \| 'center'` | Button alignment, defaults to `'left'` |
| `fullWidthButtons` | `boolean` | Stretch buttons to full width |

## `InputField`

Renders a labeled `<input type="text">`.

```tsx
<InputField<M, 'email'>
  name='email'
  label='Email address'
  defaultValue='user@example.com'
  required
  pattern={/^[^@]+@[^@]+$/}
/>
```

| Prop | Type | Description |
| --- | --- | --- |
| `name` | `StringKeyOf<M>` | Field name; must match a key in the form value type |
| `label` | `string` | Visible label text |
| `defaultValue` | `M[N]` | Initial value |
| `disabled` | `boolean` | Disables the input |
| `readonly` | `boolean` | Makes the input read-only |
| `parse` | `(raw: string) => M[N]` | Convert DOM string to typed value |
| `format` | `(val: M[N]) => string` | Convert typed value back to display string |
| `validator` | `CustomValidator<M, N>` | Custom validation function |
| `required`, `minLength`, `maxLength`, `pattern`, `min`, `max`, `match` | Constraint props | Built-in validation constraints |

All standard HTML input attributes are also accepted.

## `PasswordField`

Same props as `InputField`. Renders `<input type="password">`.

## `TextAreaField`

Same props as `InputField`, except `type`. Renders a `<textarea>`.

```tsx
<TextAreaField name='bio' label='Bio' maxLength={500} />
```

## `CheckboxField`

Renders a labeled checkbox. The field value in form state is a boolean.

```tsx
<CheckboxField name='acceptTerms' label='I accept the terms' required />
```

| Prop | Type | Description |
| --- | --- | --- |
| `name` | `StringKeyOf<M>` | Field name |
| `label` | `string` | Label text |
| `defaultChecked` | `boolean` | Initial checked state |
| `disabled` | `boolean` | Disables the checkbox |
| `required` | `boolean` | Field must be `true` to be valid |
| `validator` | `CustomValidator<M, N>` | Custom validation function |

## `SubmitButton`

Renders a submit button. It is disabled automatically when the form has validation errors.

```tsx
<SubmitButton>Log in</SubmitButton>

<SubmitButton name='saveDraft'>Save draft</SubmitButton>
<SubmitButton name='publish'>Publish</SubmitButton>
```

Named submit buttons select a handler from an object-style `onSubmit` map, for example
`onSubmit={{ saveDraft, publish }}`.

| Prop | Type | Description |
| --- | --- | --- |
| `children` | `JSX.Element` | Button label |
| `isDisabled` | `boolean` | Override disabled state |
| `isFullWidth` | `boolean` | Stretch to container width |
| `name` | `string` | Optional field name for multi-button forms |
| `variant` | `'primary' \| 'approve'` | Visual variant; `approve` renders `type="button"` |

## State API

`form.state` is reactive. Access it inside Solid signals, `createEffect`, or JSX to get fine-grained
updates.

| Property or method | Type | Description |
| --- | --- | --- |
| `isFormValid` | `boolean` | `true` when no registered field has errors |
| `haveValuesChanged` | `boolean` | `true` when any field has changed from its initial value |
| `isLoading` | `boolean` | Form is in a loading state |
| `isProcessing` | `boolean` | Async submit handler is in flight |
| `errors` | `string[]` | Form-level errors, including thrown or rejected submit errors |
| `getFieldValue(name)` | `M[N] \| undefined` | Current parsed value for a field |
| `getFieldErrors(name)` | `string[] \| undefined` | Current errors for a field |
| `isFieldValid(name)` | `boolean \| undefined` | `false` if the field has errors; `undefined` if not registered |
| `hasFieldBeenValid(name)` | `boolean \| undefined` | `true` once the field has been error-free |
| `hasFieldBlurred(name)` | `boolean \| undefined` | `true` once the user has blurred the field |
| `hasFieldChanged(name)` | `boolean \| undefined` | `true` once the field value has changed |
| `hasFieldBeenInitialized(name)` | `boolean` | `true` once the field has registered with the store |
