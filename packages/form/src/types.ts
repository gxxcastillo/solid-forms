import { type JSX } from 'solid-js';

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

export type ErrorResult = {
  message: string;
  code: string;
};

export type RequestProps = object;

export type SubmitResponse = object | string | [] | null | void;
export type SubmitResponseMapping<P extends RequestProps> = Record<string, OnSubmitHandler<P, SubmitResponse>>;
export type OnSubmitHandler<P extends RequestProps, R extends SubmitResponse = void> = (
  props: P,
  buttonName: string
) => Promise<R> | void;

export type OnSubmitHandlers<P extends RequestProps, M extends SubmitResponseMapping<P>> = {
  [K in keyof M]: M[K];
};

export type BaseFormOnSubmit<P extends RequestProps, R extends SubmitResponse | SubmitResponseMapping<P>> =
  R extends SubmitResponseMapping<P> ? OnSubmitHandlers<P, R> : OnSubmitHandler<P, R>;

export type BaseFormElementSubmitEvent = Event & { submitter: HTMLElement | null };
export type BaseFormElementOnSubmitHandler = JSX.EventHandler<HTMLFormElement, BaseFormElementSubmitEvent>;
