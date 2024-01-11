import { FieldName, type FieldValue, type FormState } from '@gxxc/solid-forms-state/types';

import { constraintConfigs } from './constraintConfigs';
import { ConstraintName, ValidationConstraints } from './types';

export function validate<V extends FieldValue = FieldValue, S extends FormState = FormState>(
  fieldName: FieldName,
  value: V,
  constraints: ValidationConstraints,
  formState: S
): string[] {
  return Object.entries(constraints)
    .map(([constraintName, constraint]) => {
      const constraintConfig = constraintConfigs[constraintName as ConstraintName];
      const isValid = constraintConfig.validate(value, constraint, formState);
      return isValid ? '' : constraintConfig.message(fieldName, constraint);
    })
    .filter(Boolean);
}
