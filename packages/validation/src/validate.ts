import { type StringKeyOf } from 'type-fest';

import { type ErrorMessages, type FieldValueFor, type FormState } from '@gxxc/solid-forms-state';

import { constraintConfigs } from './constraintConfigs';
import { type ConstraintName, type ValidationConstraints } from './types';

export interface ValidateFieldArgs<M extends object, N extends StringKeyOf<M>, C extends ConstraintName> {
  // Display text only (e.g. a field's configured `label`) — never used as a form key.
  fieldName: string;
  fieldValue: FieldValueFor<M, N> | undefined;
  formState: FormState<M>;
  constraintName: C;
  constraint: ValidationConstraints[C];
}

export function validateAgainstConstraint<
  M extends object,
  N extends StringKeyOf<M>,
  C extends ConstraintName
>({ fieldName, fieldValue, formState, constraintName, constraint }: ValidateFieldArgs<M, N, C>) {
  const validator = constraintConfigs[constraintName];
  const isValid = validator.validate(fieldValue, constraint, formState);
  return isValid ? '' : validator.message(fieldName, constraint, formState);
}

export function validate<M extends object, N extends StringKeyOf<M>>(
  fieldName: N,
  fieldValue: FieldValueFor<M, N> | undefined,
  constraints: ValidationConstraints,
  formState: FormState<M>,
  displayName: string = fieldName
): ErrorMessages {
  return Object.entries(constraints)
    .filter(([, constraint]) => constraint != null && constraint !== false)
    .map(([name, constraint]) => {
      const constraintName = name as ConstraintName;
      return validateAgainstConstraint({
        fieldName: displayName,
        fieldValue,
        formState,
        constraintName,
        constraint
      });
    })
    .filter(Boolean);
}
