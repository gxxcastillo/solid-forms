import { type FieldValue, type FormState } from '@gxxc/solid-forms-state';

export interface ValidationConstraints {
  match?: string;
  max?: number;
  maxLength?: number;
  min?: number;
  minLength?: number;
  pattern?: string;
  required?: boolean;
}

export type ConstraintName = keyof ValidationConstraints;
export type Constraint = ValidationConstraints[ConstraintName];

export interface ConstraintConfig {
  validate: (v: FieldValue, c: Constraint | undefined, s: FormState) => boolean;
  message: (n: string, c: Constraint) => string;
}

export type ConstraintConfigs = {
  [name in ConstraintName]: ConstraintConfig;
};
