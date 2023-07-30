import { JSX } from 'solid-js';

export type DefaultFieldValue = string;
export type FieldName = string;

export type CustomValidator<V> = (
  fieldName: FieldName,
  fieldValue: V,
  getFields: () => FormField[],
  getFieldErrors: (n: FieldName) => string[] | undefined,
  setFieldErrors: (e: ErrorMessages) => void
) => void;

export type FieldValue<V = any> = V;

export type SelectableFieldType = 'checkbox' | 'radio' | 'select';

export type ErrorMessage = string;
export type ErrorMessages = ErrorMessage[];
export type FormErrors = Record<FieldName, ErrorMessages | undefined>;

export type FieldBuilderProps<P, V> = FieldSetBaseProps & FieldSetInternalProps<V> & P;

// @TODO - FieldSetProps<P, V> might end up causing a problem IF the "component" passed into this FormField does not take FieldSetProps<P, V> as props
// in which case, I'd have to figure out some way of finding out what properties the "component" takes, and use those instead
// for now, I hope this works...
export type FormFieldProps<P, V> = FormFieldComponentProps<P, V> & {
  component: JSX.Element;
};

export type FormFieldComponentProps<P, V> = FieldSetBaseProps &
  FormFieldComponentBaseProps<V> &
  Omit<P, keyof FieldSetInternalProps<V> | 'defaultValue' | 'name'>;

export type FormFieldComponentBaseProps<V> = any & {
  value?: V;
  defaultValue?: V;
  defaultChecked?: boolean;
  isControlled?: boolean;
  match?: FieldName;
  validator?: CustomValidator<V>;
};

export interface FormFieldBaseProps<P> {
  component: JSX.Element;
}

export interface FieldSetBaseProps {
  name: string;
  label?: string;
  isLoading?: boolean;
}

export interface FieldSetInternalProps<V> {
  id?: string;
  error?: ErrorMessage;
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
  validate: (
    v: FieldValue | undefined,
    c: Constraint | undefined,
    s: [FormState, FormStateSetters]
  ) => boolean;
  message: (n: string, c: Constraint) => string;
}

export type ConstraintConfigs = {
  [name in ConstraintName]: ConstraintConfig;
};

export interface UseFormContextProps<V = unknown> extends ValidationConstraints {
  value?: V;
  name: string;
  disabled?: boolean;
  readOnly?: boolean;
  checked?: boolean;
  isSelectable?: boolean;
  isLoading?: boolean;
}

export interface FormField<V = DefaultFieldValue> {
  name: string;
  value: V;
  errors: ErrorMessages;
  hasBeenBlurred: boolean;
  hasChanged: boolean;
  hasBeenValid: boolean;
}

export interface FormState {
  fields: FormField[];
  isReady: boolean;
  isLoading: boolean;
  isProcessing: boolean;
  haveValuesChanged: boolean;
  isFormValid: boolean;
  isFieldValid: (n: FieldName) => boolean | undefined;
  getField: (n: FieldName) => FormField | undefined;
  getFieldValue: (n: FieldName) => FieldValue;
  getFieldErrors: (n: FieldName) => ErrorMessages | undefined;
  hasFieldBeenInitialized: (n: FieldName) => boolean;
  hasFieldBeenValid: (n: FieldName) => boolean | undefined;
  hasFieldChanged: (n: FieldName) => boolean | undefined;
  hasFieldBlurred: (n: FieldName) => boolean | undefined;
}

export interface FormStateSetters {
  initializeField: (name: FieldName, value: FieldValue, errors: ErrorMessages) => void;
  setFieldValue: (name: FieldName, value: FieldValue, errors: ErrorMessages) => void;
  setChangedField: (name: FieldName) => void;
  setBlurredField: (name: FieldName) => void;
  setIsProcessing: (isProcessing: boolean) => void;
}

export type FormContextProps = FormState;

export type FieldSetter<V> = (fieldName: FieldName, fieldValue: V) => void;

export type FormOnChangeHandler = (fieldName: FieldName, fieldValue: FieldValue) => void;

export type FieldOnChangeHandler<T = JSX.Element> = JSX.EventHandler<T, InputEvent>;
export type FieldOnBlurHandler<T = JSX.Element> = JSX.EventHandler<T, UIEvent>;

export interface GraphQLFieldError {
  message: string;
  code: string;
}

export type GraphQLFieldErrors = Record<string, GraphQLFieldError[]>;

export interface ErrorResult {
  message: string;
  code: string;
}

export type ErrorResults = ErrorResult[];
export type FormErrorResult = Record<string, ErrorResult>;

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
