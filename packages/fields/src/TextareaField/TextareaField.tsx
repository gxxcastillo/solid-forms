import { createMemo, splitProps } from 'solid-js';
import { StringKeyOf } from 'type-fest';

import { Textarea } from '@gxxc/solid-forms-elements';
import { FieldValueMapping, useFormContext } from '@gxxc/solid-forms-state';

import { useFormField, useFormFieldLabel } from '../hooks';
import { FormFieldProps } from '../types';
import styles from './TextareaField.module.css';

export type TextAreaFieldProps<M extends FieldValueMapping, N extends StringKeyOf<M>> = FormFieldProps<
  'textarea',
  M,
  N
> & {
  title?: string;
};

export function TextAreaField<M extends FieldValueMapping, N extends StringKeyOf<M>>(
  initialProps: TextAreaFieldProps<M, N>
) {
  const [formState] = useFormContext<M>();
  const [localProps, parsedProps] = splitProps(initialProps, ['title']);

  const formField = createMemo(() => useFormField(parsedProps));
  const props = createMemo(() => formField()[0]);
  const createField = formField()[1];
  const value = createMemo(() => formState.getFieldValue(props().name));
  const initialLabel = createMemo(() => props().label);
  const label = createMemo(() =>
    useFormFieldLabel({
      value: value(),
      label: initialLabel()
    })
  );

  return createField(
    'TextareaField',
    <div class={styles.TextArea}>
      {localProps.title && <div class={styles.title}>{localProps.title}</div>}
      <div class={styles.textAreaContainer}>
        <div class={styles.textArea}>
          <Textarea {...props} placeholder={label().placeholder} class={styles.textAreaEl} />
        </div>
      </div>
    </div>
  );
}
