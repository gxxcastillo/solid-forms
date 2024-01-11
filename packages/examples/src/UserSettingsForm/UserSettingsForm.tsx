import { Form, InputField, SubmitButton, TextAreaField } from '@gxxc/solid-forms';

export function UserSettingsForm() {
  function onSubmit(values: unknown) {
    console.log('adsfaaaaaaaadf', values);
  }

  return (
    <Form onSubmit={onSubmit}>
      <InputField name='username' label='Username' />
      <TextAreaField name='bio' label='Bio' />
      <SubmitButton>Submit</SubmitButton>
    </Form>
  );
}
