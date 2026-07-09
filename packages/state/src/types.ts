import { type StringKeyOf } from 'type-fest';

export type FieldName = string;

export type DisplayValue = string | number | string[] | undefined;
export type FieldValue = unknown;
export type FieldValueFor<M extends object, N extends StringKeyOf<M>> = N extends keyof M ? M[N] : FieldValue;

export type ErrorMessage = string;
export type ErrorMessages = ErrorMessage[] | [];

export type FormField<M extends object, N extends StringKeyOf<M>> = {
  name: N;
  value: FieldValueFor<M, N> | undefined;
  errors: ErrorMessages;
  label?: string;
  hasBeenInitialized: boolean;
  hasBeenBlurred: boolean;
  hasChanged: boolean;
  hasBeenValid: boolean;
};

export type FormFields<M extends object> = FormField<M, StringKeyOf<M>>[];

export type FieldValueMapping = Record<string, FieldValue | undefined>;

export type FormStore<M extends object = FieldValueMapping> = readonly [FormState<M>, FormStateMutations<M>];

export type BaseFormState<M extends object = FieldValueMapping> = {
  fields: FormFields<M>;
  errors: ErrorMessages;
  isReady: boolean;
  isLoading: boolean;
  isProcessing: boolean;
};

// @TODO Do I still need these?
// export type InferFieldValueMapping<S extends FormState> = S extends FormState<infer M> ? M : never;
// export type InferBaseFormState<S extends FormState> = S extends FormState<infer M> ? BaseFormState<M> : never;

export type FormState<M extends object = FieldValueMapping> = BaseFormState<M> & FormStateGetters<M>;

export type FormStateGetters<M extends object = FieldValueMapping> = {
  haveValuesChanged: boolean;
  isFormValid: boolean;
  isFieldValid: <N extends StringKeyOf<M>>(n: N) => boolean | undefined;
  getField: <N extends StringKeyOf<M>>(n: N) => FormField<M, N> | undefined;
  getFieldValue: <N extends StringKeyOf<M>>(n: N) => FieldValueFor<M, N> | undefined;
  getFieldErrors: <N extends StringKeyOf<M>>(n: N) => ErrorMessages | undefined;
  hasFieldBeenInitialized: <N extends StringKeyOf<M>>(n: N) => boolean;
  hasFieldBeenValid: <N extends StringKeyOf<M>>(n: N) => boolean | undefined;
  hasFieldChanged: <N extends StringKeyOf<M>>(n: N) => boolean | undefined;
  hasFieldBlurred: <N extends StringKeyOf<M>>(n: N) => boolean | undefined;
};

export type FormStateMutations<M extends object = FieldValueMapping> = {
  initializeField: <N extends StringKeyOf<M>>(
    name: N,
    value?: FieldValueFor<M, N>,
    errors?: ErrorMessages,
    label?: string
  ) => void;
  removeField: <N extends StringKeyOf<M>>(name: N) => void;
  setFieldValue: <N extends StringKeyOf<M>>(
    name: N,
    value?: FieldValueFor<M, N>,
    errors?: ErrorMessages
  ) => void;
  setFieldErrors: <N extends StringKeyOf<M>>(name: N, errors?: ErrorMessages) => void;
  setChangedField: <N extends StringKeyOf<M>>(name: N) => void;
  setBlurredField: <N extends StringKeyOf<M>>(name: N) => void;
  setErrors: (errors?: ErrorMessages) => void;
  setIsReady: (isReady: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsProcessing: (isProcessing: boolean) => void;
};
