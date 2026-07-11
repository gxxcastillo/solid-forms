import { type ErrorMessages, type FieldValue, type FormState } from '@gxxc/solid-forms-state';

export interface StandardSchemaV1<Input = unknown, Output = Input> {
  readonly '~standard': StandardSchemaV1Props<Input, Output>;
}

export interface StandardSchemaV1Props<Input = unknown, Output = Input> {
  readonly version: 1;
  readonly vendor: string;
  readonly validate: (
    value: unknown,
    options?: StandardSchemaV1Options | undefined
  ) => StandardSchemaV1Result<Output> | Promise<StandardSchemaV1Result<Output>>;
  readonly types?: StandardSchemaV1Types<Input, Output> | undefined;
}

export interface StandardSchemaV1Options {
  readonly libraryOptions?: Record<string, unknown> | undefined;
}

export interface StandardSchemaV1Types<Input = unknown, Output = Input> {
  readonly input: Input;
  readonly output: Output;
}

export type StandardSchemaV1Result<Output> =
  StandardSchemaV1SuccessResult<Output> | StandardSchemaV1FailureResult;

export interface StandardSchemaV1SuccessResult<Output> {
  readonly value: Output;
  readonly issues?: undefined;
}

export interface StandardSchemaV1FailureResult {
  readonly issues: ReadonlyArray<StandardSchemaV1Issue>;
}

export interface StandardSchemaV1Issue {
  readonly message: string;
  readonly path?: ReadonlyArray<PropertyKey | StandardSchemaV1PathSegment> | undefined;
}

export interface StandardSchemaV1PathSegment {
  readonly key: PropertyKey;
}

export type InferStandardSchemaInput<Schema extends StandardSchemaV1> = NonNullable<
  Schema['~standard']['types']
>['input'];

export type InferStandardSchemaOutput<Schema extends StandardSchemaV1> = NonNullable<
  Schema['~standard']['types']
>['output'];

export type StandardSchemaFormValues<Schema extends StandardSchemaV1> =
  InferStandardSchemaInput<Schema> extends object ? InferStandardSchemaInput<Schema> : never;

export type StandardSchemaSubmitValues<Schema extends StandardSchemaV1> =
  InferStandardSchemaOutput<Schema> extends object ? InferStandardSchemaOutput<Schema> : never;

export type SchemaValidationFailure = {
  valid: false;
  fieldErrors: Map<string, ErrorMessages>;
  formErrors: ErrorMessages;
};

export type SchemaValidationSuccess<M extends object> = {
  valid: true;
  value: M;
};

export type SchemaValidationResult<M extends object> = SchemaValidationSuccess<M> | SchemaValidationFailure;

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
