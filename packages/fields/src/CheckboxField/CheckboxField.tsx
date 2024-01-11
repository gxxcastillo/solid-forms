import { Checkbox } from '@gxxc/solid-forms-elements';

import { FormFieldProps } from '../types';
import styles from './CheckboxField.module.css';

// ElementProps<HTMLInputElement>,
export interface CheckboxFieldProps<V> extends FormFieldProps<'input', V> {}

export function CheckboxField<V>({ value, label, errors: errs, ...props }: CheckboxFieldProps<V>) {
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
