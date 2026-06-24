import { mergeProps, splitProps } from 'solid-js';
import { type StringKeyOf } from 'type-fest';

import { Checkbox } from '@gxxc/solid-forms-elements';
import { type FieldValueMapping } from '@gxxc/solid-forms-state';

import { createFormField } from '../hooks';
import { type FormFieldProps } from '../types';
import styles from './CheckboxField.module.css';

export type CheckboxFieldProps<M extends FieldValueMapping, N extends StringKeyOf<M>> = FormFieldProps<
  'input',
  M,
  N
>;

export function CheckboxField<M extends FieldValueMapping, N extends StringKeyOf<M>>(
  initialProps: CheckboxFieldProps<M, N>
) {
  const [localProps, parsedProps] = splitProps(initialProps, ['label']);
  const [props, createField] = createFormField<'input', M, N>(
    mergeProps({ isSelectable: true }, parsedProps)
  )();

  return createField(
    'CheckboxField',
    <div
      classList={{
        [styles.CheckboxFieldSet]: true,
        [styles.checked]: !!props.checked,
        [styles.disabled]: !!props.disabled
      }}
    >
      <Checkbox {...props} />
      {localProps.label && (
        <label classList={{ [styles.label]: true, [styles.disabled]: !!props.disabled }} for={props.id}>
          {localProps.label}
        </label>
      )}
      {props.errors?.[0] && <div class={styles.error}>{props.errors[0]}</div>}
    </div>
  );
}

export default CheckboxField;
