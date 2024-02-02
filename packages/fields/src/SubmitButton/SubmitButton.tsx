import { createMemo, children as prepareChildren, splitProps } from 'solid-js';
import { type StringKeyOf } from 'type-fest';

import { Button } from '@gxxc/solid-forms-elements';
import { type FieldValueMapping, useFormContext } from '@gxxc/solid-forms-state';

import { createField } from '../hooks';
import { type FormFieldProps } from '../types';

export type SubmitButtonProps<M extends FieldValueMapping, N extends StringKeyOf<M>> = Omit<
  FormFieldProps<'input', M, N>,
  'name'
> & {
  name?: string;
  type?: 'approve' | 'primary';
  isFullWidth?: boolean;
};

export function SubmitButton<M extends FieldValueMapping, N extends StringKeyOf<M>>(
  initialProps: SubmitButtonProps<M, N>
) {
  const [formState] = useFormContext();
  const [localProps, parsedProps] = splitProps(initialProps, [
    'type',
    'isDisabled',
    'isValid',
    'isFullWidth',
    'onClick'
  ]);

  const props = createMemo(() => ({
    type: localProps.type === 'approve' ? 'button' : 'submit',
    onClick: localProps.onClick
      ? localProps.onClick
      : parsedProps.name
        ? () => parsedProps.setValue?.(parsedProps.parse?.(parsedProps.value))
        : undefined,
    isDisabled: localProps.isDisabled ?? (!localProps.isDisabled && !formState.isFormValid),
    children: prepareChildren(() => parsedProps.children)
  }));

  return createField(
    'SubmitButton',
    <div>
      <Button
        type={props().type}
        {...props}
        disabled={props().isDisabled}
        onClick={props().onClick}
        value={props().children()?.toString() ?? 'submit'}
      />
    </div>
  );
}
