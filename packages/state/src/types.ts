import { StringKeyOf } from 'type-fest';

export type DefaultFieldValue = string;
export type FieldName = string;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FieldValue = any;

export type ErrorMessage = string;
export type ErrorMessages = ErrorMessage[];

export interface FormField<V = string> {
  name: string;
  value: V;
  errors: ErrorMessages;
  hasBeenBlurred: boolean;
  hasChanged: boolean;
  hasBeenValid: boolean;
}

export type FormFields<M extends FieldValueMapping> = FormField<M[keyof M]>[];
export type FieldValueMapping = Record<string, unknown>;

export interface BaseFormState<M extends FieldValueMapping = FieldValueMapping> {
  fields: FormFields<M>;
  errors: ErrorMessages;
  isReady: boolean;
  isLoading: boolean;
  isProcessing: boolean;
}

export type InferFieldValueMapping<S extends FormState> = S extends FormState<infer M> ? M : never;

export type InferBaseFormState<S extends FormState> = S extends FormState<infer M> ? BaseFormState<M> : never;

export type FormState<M extends FieldValueMapping = FieldValueMapping> = BaseFormState<M> &
  FormStateGetters<M>;

export interface FormStateGetters<M extends FieldValueMapping = FieldValueMapping> {
  haveValuesChanged: boolean;
  isFormValid: boolean;
  isFieldValid: (n: keyof M) => boolean | undefined;
  getField: (n: keyof M) => FormField<M[keyof M]> | undefined;
  getFieldValue: (n: keyof M) => M[keyof M];
  getFieldErrors: (n: keyof M) => ErrorMessages | undefined;
  hasFieldBeenInitialized: (n: keyof M) => boolean;
  hasFieldBeenValid: (n: keyof M) => boolean | undefined;
  hasFieldChanged: (n: keyof M) => boolean | undefined;
  hasFieldBlurred: (n: keyof M) => boolean | undefined;
}

export interface FormStateMutations<M extends FieldValueMapping = FieldValueMapping> {
  initializeField: <K extends StringKeyOf<M>, V extends M[K]>(
    name: K,
    value?: V,
    errors?: ErrorMessages
  ) => void;
  setFieldValue: <K extends StringKeyOf<M>, V extends M[K]>(
    name: K,
    value?: V,
    errors?: ErrorMessages
  ) => void;
  setChangedField: <K extends StringKeyOf<M>>(name: K) => void;
  setBlurredField: <K extends StringKeyOf<M>>(name: K) => void;
  setIsProcessing: (isProcessing: boolean) => void;
}
