import { createMemo, children as prepareChildren, splitProps } from 'solid-js';
import { type StringKeyOf } from 'type-fest';

import { Button, type ButtonElementProps } from '@gxxc/solid-forms-elements';
import { type FieldValueMapping, useFormContext } from '@gxxc/solid-forms-state';

import { createField } from '../hooks';
import { type FormFieldProps } from '../types';
import styles from './SubmitButton.module.css';

export type SubmitButtonProps<M extends FieldValueMapping, N extends StringKeyOf<M>> = Omit<
  FormFieldProps<'input', M, N>,
  'name'
> & {
  name?: string;
  variant?: 'approve' | 'primary';
  isFullWidth?: boolean;
};

export function SubmitButton<M extends FieldValueMapping, N extends StringKeyOf<M>>(
  initialProps: SubmitButtonProps<M, N>
) {
  const [formState] = useFormContext();
  const [localProps, parsedProps] = splitProps(initialProps, [
    'variant',
    'isDisabled',
    'isValid',
    'isFullWidth',
    'onClick'
  ]);

  const resolvedChildren = prepareChildren(() => parsedProps.children);
  const label = createMemo(() => resolvedChildren() ?? 'submit');
  const buttonType = createMemo(() => (localProps.variant === 'approve' ? 'button' : 'submit'));
  // localProps.onClick is typed against the 'input' element tag (SubmitButton reuses
  // FormFieldProps to inherit value/parse/setValue), but Button renders a real
  // <button>; a mouse click handler works identically on either element.
  const onClick = createMemo(() =>
    localProps.onClick
      ? (localProps.onClick as ButtonElementProps['onClick'])
      : parsedProps.name
        ? () => parsedProps.setValue?.(parsedProps.parse?.(parsedProps.value))
        : undefined
  );
  const isDisabled = createMemo(() => localProps.isDisabled ?? !formState.isFormValid);

  return createField(
    'SubmitButton',
    <div>
      <Button
        type={buttonType()}
        name={parsedProps.name}
        disabled={isDisabled()}
        onClick={onClick()}
        classList={{
          [styles.button]: true,
          [styles.approve]: localProps.variant === 'approve',
          [styles.fullWidth]: !!localProps.isFullWidth
        }}
      >
        {label()}
      </Button>
    </div>
  );
}
