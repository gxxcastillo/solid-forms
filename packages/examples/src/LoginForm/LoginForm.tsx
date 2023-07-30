import { Form, InputField, SubmitButton } from '@gxxc/solid-forms';

export function LoginForm() {
  function onSubmit(values: unknown) {
    console.log('--->', values);
  }

  return (
    <Form onSubmit={onSubmit}>
      <InputField name='username' label='Username' />
      <InputField name='password' label='Username' />
      <SubmitButton>Login</SubmitButton>
    </Form>
  );
}
