import { StringKeyOf } from 'type-fest';

import { FieldValueMapping } from '@gxxc/solid-forms-state';

import { InputField, InputFieldProps } from '../InputField/InputField';

export type PasswordFieldProps<M extends FieldValueMapping, N extends StringKeyOf<M>> = InputFieldProps<M, N>;

export function PasswordField<M extends FieldValueMapping, N extends StringKeyOf<M>>(
  props: PasswordFieldProps<M, N>
) {
  return <InputField {...props} />;
}

export default PasswordField;
