import { InputField, PasswordField, SubmitButton, TextAreaField, useForm } from '@gxxc/solid-forms';

interface LoginFormValues {
  [key: string]: string;
  email: string;
  password: string;
  message: string;
}

function Login() {
  function onSubmit({ email, password, message }: LoginFormValues) {
    console.log('login submitted', { email, password, message });
  }

  const form = useForm<LoginFormValues, void>();

  return (
    <div>
      <div>
        <div>email: {form.state.getFieldValue('email')}</div>
        <div>password: {form.state.getFieldValue('password')}</div>
        <div>message: {form.state.getFieldValue('message')}</div>
      </div>

      <form.Form onSubmit={onSubmit}>
        <InputField name='email' label='Email' required />
        <PasswordField name='password' label='Password' required minLength={8} />
        <TextAreaField name='message' label='Care to send a message?' />
        <SubmitButton />
      </form.Form>
    </div>
  );
}

export default Login;
