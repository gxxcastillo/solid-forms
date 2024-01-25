import { InputField, PasswordField, SubmitButton, TextAreaField, useForm } from '@gxxc/solid-forms';

interface LoginFormProps {
  [x: string]: unknown;
  key: 'name' | 'age';
  email: string;
  password: number;
  message: string;
}

function Login() {
  function onSubmit({ email, password, message }: LoginFormProps) {
    console.log('email', email)
    console.log('password', password)
    console.log('message', message)
  }

  const form = useForm<LoginFormProps>();

  return (
    <div>
      <div>
        <div>email: {form.state.getFieldValue('email')}</div>
        <div>password: {form.state.getFieldValue('password')}</div>
        <div>message: {form.state.getFieldValue('message')}</div>
      </div>

      <form.Form onSubmit={onSubmit}>
        <InputField name='email' label='email' />
        <PasswordField name='password' label='password' />
        <TextAreaField name='message' label='care to send a message?' />
        <SubmitButton />
      </form.Form>
    </div>
  );
}

export default Login;
