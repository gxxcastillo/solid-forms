import { SubmitButton, createForm } from '@gxxc/solid-forms';

export interface UserSettingsValues {
  username: string;
  bio: string;
}

export interface UserSettingsFormProps {
  onSubmit?: (values: UserSettingsValues) => void | Promise<void>;
}

const { Form, InputField, TextAreaField } = createForm<UserSettingsValues>();

export function UserSettingsForm(props: UserSettingsFormProps) {
  return (
    <Form onSubmit={props.onSubmit ?? (() => undefined)}>
      <InputField name='username' label='Username' />
      <TextAreaField name='bio' label='Bio' />
      <SubmitButton>Submit</SubmitButton>
    </Form>
  );
}
