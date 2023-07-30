import { constraintConfigs } from './constraintConfigs';
import { ConstraintName, FieldValue, ValidationConstraints } from './types';

export function validate<V = FieldValue, S extends object = object>(
  fieldName: string,
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
