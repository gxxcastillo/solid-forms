## Solid Forms (WIP)

THIS IS A WORK IN PROGRESS

Solid Forms is a library for creating forms with SolidJS

## Usage

### Installation

```bash
npm install solid-forms
```

### Include in your project

```
import { InputField, PasswordField, useForm } from '@gxxc/solid-forms';

import { InputField, PasswordField, useForm } from '@gxxc/solid-forms';

interface LoginFormProps {
  email: string;
  password: string;
}

function Login() {
  const form = useForm<LoginFormProps, LoginFormProps>();

  return (
    <div>
      <form.Form>
        <InputField name='email' label='tester input' />
        <PasswordField name='password' label='tester password' />
      </form.Form>
    </div>
  );
}
```
