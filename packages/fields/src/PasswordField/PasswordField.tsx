import { type StringKeyOf } from 'type-fest';

import { type FieldValueMapping } from '@gxxc/solid-forms-state';

import { InputField, type InputFieldProps } from '../InputField/InputField';

export type PasswordFieldProps<M extends FieldValueMapping, N extends StringKeyOf<M>> = InputFieldProps<M, N>;

export function PasswordField<M extends FieldValueMapping, N extends StringKeyOf<M>>(
  props: PasswordFieldProps<M, N>
) {
  props.type = 'password';
  return <InputField {...props} />;
}

export default PasswordField;
