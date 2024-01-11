import { InputField, InputFieldProps } from '../InputField/InputField';

export type PasswordFieldProps = InputFieldProps<string>;

export function PasswordField(props: PasswordFieldProps) {
  return <InputField {...props} />;
}

export default PasswordField;
