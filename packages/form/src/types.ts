import { type JSX } from 'solid-js';

import { type ErrorMessages, type FieldValue } from '@gxxc/solid-forms-state';

export type DefaultFieldValue = string;
export type FieldName = string;

export type CustomValidator<V> = (
  fieldName: FieldName,
  fieldValue: V,
  getFields: () => FormField[],
  getFieldErrors: (n: FieldName) => string[] | undefined,
  setFieldErrors: (e: ErrorMessages) => void
) => void;

export type SelectableFieldType = 'checkbox' | 'radio' | 'select';

export type FormErrors = Record<FieldName, ErrorMessages | undefined>;

export interface FieldSetBaseProps {
  name: string;
  label?: string;
  isLoading?: boolean;
}

export interface FieldSetInternalProps<V> {
  id?: string;
  errors?: ErrorMessages;
  value?: V;
  isInitialized?: boolean;
  setValue?: (value?: V, initialize?: boolean) => void;
  showIcon?: (value?: V, e?: ErrorMessages) => boolean;
  onChange?: FieldOnChangeHandler<V>;
  onBlur?: FieldOnBlurHandler;
  'data-for'?: string;
  'data-tip'?: string;
}

export type FormElementRef = HTMLDivElement | HTMLFormElement;

export interface FormField<V = DefaultFieldValue> {
  name: string;
  value: V;
  errors: ErrorMessages;
  hasBeenBlurred: boolean;
  hasChanged: boolean;
  hasBeenValid: boolean;
}

export type FieldSetter<V> = (fieldName: FieldName, fieldValue: V) => void;

export type FormOnChangeHandler = (fieldName: FieldName, fieldValue: FieldValue) => void;

export type FieldOnChangeHandler<T = JSX.Element> = JSX.EventHandler<T, InputEvent>;
export type FieldOnBlurHandler<T = JSX.Element> = JSX.EventHandler<T, UIEvent>;

export interface ErrorResult {
  message: string;
  code: string;
}

export type ErrorResults = ErrorResult[];
export type FormErrorResult = Record<string, ErrorResult>;

export type Response = object | string | [] | null | void;
export type RequestProps = Record<string, string | null | undefined>;
export type OnSubmitHandler<R extends Response = void> = (
  props: RequestProps,
  buttonName: string
) => Promise<R> | void;

export type OnSubmitHandlers = Record<string, OnSubmitHandler>;

export type BaseFormOnSubmit = OnSubmitHandler | OnSubmitHandlers;

export type BaseFormElementSubmitEvent = Event & { submitter: HTMLElement };
export type BaseFormElementOnSubmitHandler = JSX.EventHandler<HTMLFormElement, BaseFormElementSubmitEvent>;

/// //////////// The new stuff ////////////

// export type FormStateSelector<S extends FormFields = FormFields> = (
//   state: NewFormState<S>,
//   ...args: unknown[]
// ) => unknown;

// export type FormStateFields<S extends FormFields = FormFields> = NewFormState<S>['fields'];
// export type FormStateFieldNames<S extends FormFields = FormFields> = keyof FormStateFields<S>;

// export type ImmutableFieldState = {
//   isInitialized: boolean;
//   hasChanged: boolean;
//   hasBeenBlurred: boolean;
// };

// export type ImmutableFormState<S extends FormFields = FormFields> = {
//   fields: Record<keyof S, ImmutableFieldState>;
// };

// export type ImmutableFormStateFields<S extends FormFields = FormFields> =
//   ImmutableFormState<S>['fields'];

// export type ImmutableFormStateFieldNames<S extends FormFields = FormFields> =
//   keyof ImmutableFormStateFields<S>;
