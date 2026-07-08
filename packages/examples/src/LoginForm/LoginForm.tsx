import { Form, InputField, PasswordField, SubmitButton, TextAreaField } from '@gxxc/solid-forms';

export interface LoginValues {
  [key: string]: string;
  email: string;
  password: string;
  message: string;
}

export interface LoginFormProps {
  onSubmit?: (values: LoginValues) => void | Promise<void>;
}

export function LoginFields() {
  return (
    <>
      <InputField name='email' label='Email' required />
      <PasswordField name='password' label='Password' required minLength={8} />
      <TextAreaField name='message' label='Care to send a message?' />
      <SubmitButton />
    </>
  );
}

export function LoginForm(props: LoginFormProps) {
  return (
    <Form<LoginValues, void> onSubmit={props.onSubmit ?? (() => undefined)}>
      <LoginFields />
    </Form>
  );
}
