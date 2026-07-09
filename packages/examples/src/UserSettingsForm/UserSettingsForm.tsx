import { Form, InputField, SubmitButton, TextAreaField } from '@gxxc/solid-forms';

export interface UserSettingsValues {
  username: string;
  bio: string;
}

export interface UserSettingsFormProps {
  onSubmit?: (values: UserSettingsValues) => void | Promise<void>;
}

export function UserSettingsForm(props: UserSettingsFormProps) {
  return (
    <Form<UserSettingsValues, void> onSubmit={props.onSubmit ?? (() => undefined)}>
      <InputField name='username' label='Username' />
      <TextAreaField name='bio' label='Bio' />
      <SubmitButton>Submit</SubmitButton>
    </Form>
  );
}
