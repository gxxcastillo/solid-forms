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

## Run the demo

```bash
pnpm moon basic-demo:dev
```

### Tasks

```bash
pnpm moon [project-name]:build
pnpm moon :build

pnpm moon [project-name]:test
pnpm moon :test

pnpm moon [project-name]:type
pnpm moon :type

pnpm moon [project-name]:lint
pnpm moon :lint
```
