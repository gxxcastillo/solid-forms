import { InputField, PasswordField, useForm } from '@gxxc/solid-forms';

interface LoginFormProps {
  [x: string]: unknown;
  key: 'name' | 'age';
  email: string;
  password: number;
}

function Login() {
  const form = useForm<LoginFormProps, LoginFormProps>();

  return (
    <div>
      <div>
        email: {form.state.getFieldValue('email')}
        password: {form.state.getFieldValue('password')}
      </div>
      <form.Form>
        <InputField name='email' label='tester input' />
        <PasswordField name='password' label='tester password' />
      </form.Form>
    </div>
  );
}

export default Login;
