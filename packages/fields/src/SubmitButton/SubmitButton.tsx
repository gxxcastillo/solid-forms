import { JSX } from 'solid-js';

import { Button } from '@gxxc/solid-forms-elements';

import { useFormField } from '../hooks';

export interface SubmitButtonProps {
  name?: string;
  type?: 'approve' | 'primary';
  value?: string;
  isFullWidth?: boolean;
  isDisabled?: boolean;
  children?: JSX.Element;
}

export function SubmitButton(initialProps: SubmitButtonProps) {
  const props = useFormField(initialProps);

  if (!props.isDisabled && !props.isValid) {
    props.isDisabled = true;
  }

  if (props.name && !props.onClick) {
    props.onClick = () => void props.setValue(props.value);
  }

  return <Button type='submit'>{props.children || 'submit'}</Button>;
}

export default SubmitButton;
