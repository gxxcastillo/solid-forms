import { Checkbox } from '@gxxc/solid-forms-elements';

import styles from './CheckboxField.module.css';

export function CheckboxFieldSet({
  value,
  label,
  error: err,
  errors: errs,
  isInitialized,
  onBlur,
  setValue,
  ...props
}: any) {
  const error = errs?.[0] ?? err;
  const { id, checked, disabled } = props;

  const classList = [
    styles.CheckboxFieldSet,
    checked && styles.checked,
    disabled && styles.disabled
  ];

  // const labelClassNames = cn(styles.label, disabled && styles.disabled);
  return (
    <div class={'rootClassNames'}>
      <Checkbox value={value} {...props} />
      {label && (
        <label class={'labelClassNames'} for={id}>
          {label}
        </label>
      )}
      {error && <div class='cn(styles.error, styles.show'>{error}</div>}
    </div>
  );
}

export default CheckboxFieldSet;
