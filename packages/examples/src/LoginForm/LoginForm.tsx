import { Form, InputField, PasswordField, SubmitButton } from '@gxxc/solid-forms';

interface LoginValues {
  [key: string]: string;
  username: string;
  password: string;
}

export function LoginForm() {
  function onSubmit(values: LoginValues) {
    console.log('login submitted', values);
  }

  return (
    <Form onSubmit={onSubmit}>
      <InputField name='username' label='Username' required />
      <PasswordField name='password' label='Password' required minLength={8} />
      <SubmitButton>Login</SubmitButton>
    </Form>
  );
}
