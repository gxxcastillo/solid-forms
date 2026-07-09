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
  initialValue: FieldValueFor<M, N> | undefined;
  errors: ErrorMessages;
  label?: string;
  hasBeenInitialized: boolean;
  hasBeenBlurred: boolean;
  hasChanged: boolean;
  hasBeenValid: boolean;
  // Drawn from a store-scoped sequence (not a per-field counter) and bumped by
  // resetField/reset/setValues (never by the field's own input/commit flow).
  // Lets a pending async custom validator tell "a newer commit of mine
  // superseded this call" (validationToken, in createFormField) apart from "an
  // external overwrite superseded this call" (this counter), so a slow
  // validator can't clobber a field that was reset out from under it. Must stay
  // store-scoped: a field that unmounts and re-registers under the same name
  // would otherwise restart at the same value a stale write already captured.
  generation: number;
  // Set alongside `generation` by whichever mutation just bumped it: `true` for
  // resetField/reset, `false` for setValues. Only meaningful in the same tick
  // as a `generation` change — createFormField reads it there to decide
  // whether to auto-revalidate (resetField/reset cleared errors without
  // checking constraints, so they need a follow-up validation pass; setValues
  // intentionally preserves existing errors, so it must not trigger one).
  wasReset: boolean;
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
  /** Returns the field's resulting generation, so callers can capture a staleness baseline without a second lookup. */
  initializeField: <N extends StringKeyOf<M>>(
    name: N,
    value?: FieldValueFor<M, N>,
    errors?: ErrorMessages,
    label?: string
  ) => number | undefined;
  removeField: <N extends StringKeyOf<M>>(name: N) => void;
  /** Returns the field's resulting generation, so callers can capture a staleness baseline without a second lookup. */
  setFieldValue: <N extends StringKeyOf<M>>(
    name: N,
    value?: FieldValueFor<M, N>,
    errors?: ErrorMessages
  ) => number;
  setFieldErrors: <N extends StringKeyOf<M>>(name: N, errors?: ErrorMessages) => void;
  setChangedField: <N extends StringKeyOf<M>>(name: N) => void;
  setBlurredField: <N extends StringKeyOf<M>>(name: N) => void;
  /** Reverts one field to its initial value and clears its errors. No-op for an unregistered field. */
  resetField: <N extends StringKeyOf<M>>(name: N) => void;
  /**
   * Reverts every registered field to its initial value and clears form-level
   * errors. Passing `toValues` rebaselines the given fields' initial value to
   * the supplied one instead (so a later no-arg `reset()`/`resetField()`
   * reverts to that new baseline) — the "load these values, then let the user
   * edit" case. Keys for fields that are not currently registered are ignored.
   */
  reset: (toValues?: Partial<M>) => void;
  /**
   * Bulk-sets current values for already-registered fields, same as calling
   * `setFieldValue` for each key — unlike `reset`, it does not touch each
   * field's initial-value baseline or clear its errors. Keys for fields that
   * are not currently registered are ignored.
   */
  setValues: (values: Partial<M>) => void;
  setErrors: (errors?: ErrorMessages) => void;
  setIsReady: (isReady: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsProcessing: (isProcessing: boolean) => void;
};
