import { InputField, PasswordField, useForm } from '@gxxc/solid-forms';

// @TODO
// Index signature for type 'string' is missing in type
// interface LoginFormState {
//   email: string;
//   password: string
// };

function Login() {
  const form = useForm();

  window.formState = form.state;

  return (
    <div>
      <form.Form>
        <InputField name='email' label='tester input' />
        <PasswordField name='password' label='tersksjs lslkk' />
      </form.Form>
    </div>
  );
}

export default Login;
