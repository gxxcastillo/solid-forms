import { type StringKeyOf } from 'type-fest';

import { type ErrorMessages, type FieldValueMapping, type FormState } from '@gxxc/solid-forms-state';

import { constraintConfigs } from './constraintConfigs';
import { type ConstraintName, type ValidationConstraints } from './types';

export interface ValidateFieldArgs<
  M extends FieldValueMapping,
  N extends StringKeyOf<M>,
  C extends ConstraintName
> {
  fieldName: N;
  fieldValue: M[N] | undefined;
  formState: FormState<M>;
  constraintName: C;
  constraint: ValidationConstraints[C];
}

export function validateAgainstConstraint<
  M extends FieldValueMapping,
  N extends StringKeyOf<M>,
  C extends ConstraintName
>({ fieldName, fieldValue, formState, constraintName, constraint }: ValidateFieldArgs<M, N, C>) {
  const validator = constraintConfigs[constraintName];
  const isValid = validator.validate(fieldValue, constraint, formState);
  return isValid ? '' : validator.message(fieldName, constraint);
}

export function validate<M extends FieldValueMapping, N extends StringKeyOf<M>>(
  fieldName: N,
  fieldValue: M[N] | undefined,
  constraints: ValidationConstraints,
  formState: FormState<M>
): ErrorMessages {
  return Object.entries(constraints)
    .map(([name, constraint]) => {
      const constraintName = name as ConstraintName;
      return validateAgainstConstraint({
        fieldName,
        fieldValue,
        formState,
        constraintName,
        constraint
      });
    })
    .filter(Boolean);
}
