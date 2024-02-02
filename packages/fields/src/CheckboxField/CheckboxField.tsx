import { type StringKeyOf } from 'type-fest';

import { type FieldValueMapping } from '@gxxc/solid-forms-state';
import { Checkbox } from '@gxxc/solid-forms-elements';

import { type FormFieldProps } from '../types';
import styles from './CheckboxField.module.css';

export type CheckboxFieldProps<M extends FieldValueMapping, N extends StringKeyOf<M>> = FormFieldProps<'input', M, N>;

export function CheckboxField<M extends FieldValueMapping, N extends StringKeyOf<M>>({ value, label, errors: errs, ...props }: CheckboxFieldProps<M, N>) {
  const error = errs?.[0]; // @TODO
  const { id, checked, disabled } = props;

  const classList = {
    [styles.CheckboxField]: true,
    [styles.checked]: checked,
    [styles.disabled]: disabled
  };

  const labelClassNames = {
    [styles.label]: true,
    [styles.disabled]: disabled
  };

  return (
    <div classList={classList}>
      <Checkbox value={value} {...props} />
      {label && (
        <label classList={labelClassNames} for={id}>
          {label}
        </label>
      )}
      {error && <div class='cn(styles.error, styles.show'>{error}</div>}
    </div>
  );
}

export default CheckboxField;
