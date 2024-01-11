import { splitProps } from 'solid-js';

import { Button } from '@gxxc/solid-forms-elements';
import { FieldName, FieldValue } from '@gxxc/solid-forms-state';

import { useFormField } from '../hooks';
import { FormFieldProps } from '../types';

// export interface SubmitButtonProps {
//   name?: string;
//
//   value?: string;

//   isDisabled?: boolean;
//   children?: JSX.Element;
// }

export type SubmitButtonProps<V = FieldValue> = FormFieldProps<'input', V> & {
  name: FieldName;
  type?: 'approve' | 'primary';
  isFullWidth?: boolean;
};

export function SubmitButton(initialProps: SubmitButtonProps) {
  const [{ type, isFullWidth, labels, label }, parsedProps] = splitProps(initialProps, [
    'type',
    'isFullWidth'
  ]);

  const [createField, props] = useFormField(parsedProps);

  if (!props.isDisabled && !props.isValid) {
    props.isDisabled = true;
  }

  if (props.name && !props.onClick) {
    props.onClick = () => props.setValue(props.value);
  }

  const inputType = type === 'primary' ? 'submit' : 'button';
  return createField(
    'Button',
    <Button type={inputType} {...props}>
      {props.children ?? 'submit'}
    </Button>
  );
}

export default SubmitButton;
