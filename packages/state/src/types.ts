import { StringKeyOf } from 'type-fest';

export type DefaultFieldValue = string;
export type FieldName = string;

export type FieldValue = unknown;

export type ErrorMessage = string;
export type ErrorMessages = ErrorMessage[] | [];

export interface FormField<M extends FieldValueMapping, N extends StringKeyOf<M>> {
  name: N;
  value: M[N] | undefined;
  errors: ErrorMessages;
  hasBeenInitialized: boolean;
  hasBeenBlurred: boolean;
  hasChanged: boolean;
  hasBeenValid: boolean;
}

export type FormFields<M extends FieldValueMapping> = FormField<M, StringKeyOf<M>>[];

export type FieldValueMapping = Record<string, FieldValue | undefined>;

export type FormStore<M extends FieldValueMapping> = readonly [FormState<M>, FormStateMutations<M>];

export interface BaseFormState<M extends FieldValueMapping = FieldValueMapping> {
  fields: FormFields<M>;
  errors: ErrorMessages;
  isReady: boolean;
  isLoading: boolean;
  isProcessing: boolean;
}

// @TODO Do I still need these?
// export type InferFieldValueMapping<S extends FormState> = S extends FormState<infer M> ? M : never;
// export type InferBaseFormState<S extends FormState> = S extends FormState<infer M> ? BaseFormState<M> : never;

export type FormState<M extends FieldValueMapping = FieldValueMapping> = BaseFormState<M> &
  FormStateGetters<M>;

export interface FormStateGetters<M extends FieldValueMapping = FieldValueMapping> {
  haveValuesChanged: boolean;
  isFormValid: boolean;
  isFieldValid: <N extends StringKeyOf<M>>(n: N) => boolean | undefined;
  getField: <N extends StringKeyOf<M>>(n: N) => FormField<M, N> | undefined;
  getFieldValue: <N extends StringKeyOf<M>>(n: N) => M[N] | undefined;
  getFieldErrors: <N extends StringKeyOf<M>>(n: N) => ErrorMessages | undefined;
  hasFieldBeenInitialized: <N extends StringKeyOf<M>>(n: N) => boolean;
  hasFieldBeenValid: <N extends StringKeyOf<M>>(n: N) => boolean | undefined;
  hasFieldChanged: <N extends StringKeyOf<M>>(n: N) => boolean | undefined;
  hasFieldBlurred: <N extends StringKeyOf<M>>(n: N) => boolean | undefined;
}

export interface FormStateMutations<M extends FieldValueMapping = FieldValueMapping> {
  initializeField: <N extends StringKeyOf<M>>(name: N, value?: M[N], errors?: ErrorMessages) => void;
  setFieldValue: <N extends StringKeyOf<M>>(name: N, value?: M[N], errors?: ErrorMessages) => void;
  setFieldErrors: <N extends StringKeyOf<M>>(name: N, errors?: ErrorMessages) => void;
  setChangedField: <N extends StringKeyOf<M>>(name: N) => void;
  setBlurredField: <N extends StringKeyOf<M>>(name: N) => void;
  setIsReady: (isReady: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsProcessing: (isProcessing: boolean) => void;
}
