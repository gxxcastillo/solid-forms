import { type FormState } from '@gxxc/solid-forms-state/types';

export type DefaultFieldValue = string;
export type FieldName = string;
export type FieldValue<V = string> = V;
export type SelectableFieldType = 'checkbox' | 'radio' | 'select';

export type ErrorMessage = string;
export type ErrorMessages = ErrorMessage[];

export type FormElementRef = HTMLDivElement | HTMLFormElement;

export type ConstraintName =
  | 'match'
  | 'max'
  | 'maxLength'
  | 'min'
  | 'minLength'
  | 'pattern'
  | 'required';

export type Constraint = boolean | number | string;

export type ValidationConstraints = {
  [constraintName in ConstraintName]?: Constraint;
};

export interface ConstraintConfig {
  validate: (v: FieldValue | undefined, c: Constraint | undefined, s: FormState) => boolean;
  message: (n: string, c: Constraint) => string;
}

export type ConstraintConfigs = {
  [name in ConstraintName]: ConstraintConfig;
};
