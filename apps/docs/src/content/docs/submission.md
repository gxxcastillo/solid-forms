---
title: Async submission
description: Handle promise-based submit handlers and form-level errors.
---

Return a promise from `onSubmit` when your submit flow is asynchronous.

```tsx
async function onSubmit(values: LoginValues) {
  const response = await api.login(values);
  if (!response.ok) {
    throw new Error('Invalid credentials');
  }
}
```

While the promise is pending, the form sets `isProcessing` to `true` and submit buttons are disabled
automatically.

## Rejected submissions

If the handler throws or its returned promise rejects, `isProcessing` is reset in a `finally` block.
The error message is added to `form.state.errors` for display.

Each new submit attempt clears existing `form.state.errors` before calling the handler, so stale
server errors do not linger after a retry begins.

## Reading processing state

Use `useForm` when you want to show state outside the form.

```tsx
const form = useForm<LoginValues>();

<Show when={form.state.isProcessing}>Signing in...</Show>;

<form.Form onSubmit={onSubmit}>
  <InputField name='email' label='Email' required />
  <PasswordField name='password' label='Password' required />
  <SubmitButton>Log in</SubmitButton>
</form.Form>;
```
