import { splitProps } from 'solid-js';
import { type StringKeyOf } from 'type-fest';

import { Checkbox } from '@gxxc/solid-forms-elements';
import { type FieldValueMapping } from '@gxxc/solid-forms-state';

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
  const [localProps, props] = splitProps(initialProps, ['value', 'label', 'errors']);

  const classList = {
    [styles.CheckboxField]: true,
    [styles.checked]: props.checked,
    [styles.disabled]: props.disabled
  };

  const labelClassNames = {
    [styles.label]: true,
    [styles.disabled]: props.disabled
  };

  return (
    <div classList={classList}>
      <Checkbox value={localProps.value} {...props} />
      {localProps.label && (
        <label classList={labelClassNames} for={props.id}>
          {localProps.label}
        </label>
      )}
      {/* {localProps.errors?.[0] && <div>{localProps.errors?.[0]}</div>} */}
    </div>
  );
}

export default CheckboxField;
