import { FieldValue, type FormState } from '@gxxc/solid-forms-state/types';

export type ConstraintName = 'match' | 'max' | 'maxLength' | 'min' | 'minLength' | 'pattern' | 'required';

export type Constraint = boolean | number | string;

export type ValidationConstraints = {
  [constraintName in ConstraintName]?: Constraint;
};

export interface ConstraintConfig {
  validate: (v: FieldValue, c: Constraint | undefined, s: FormState) => boolean;
  message: (n: string, c: Constraint) => string;
}

export type ConstraintConfigs = {
  [name in ConstraintName]: ConstraintConfig;
};
