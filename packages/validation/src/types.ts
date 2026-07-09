import { type FieldValue, type FormState } from '@gxxc/solid-forms-state';

export type ValidationConstraints = {
  match?: string;
  max?: number;
  maxLength?: number;
  min?: number;
  minLength?: number;
  pattern?: string | RegExp;
  required?: boolean;
};

export type ConstraintName = keyof ValidationConstraints;
export type Constraint = ValidationConstraints[ConstraintName];

export type ConstraintConfig = {
  validate: <M extends object>(v: FieldValue, c: Constraint | undefined, s: FormState<M>) => boolean;
  message: <M extends object>(n: string, c: Constraint, s: FormState<M>) => string;
};

export type ConstraintConfigs = {
  [name in ConstraintName]: ConstraintConfig;
};
