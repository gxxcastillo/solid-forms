import { type JSX } from 'solid-js';

import {
  type ErrorMessages,
  type FieldName,
  type FieldValue,
  type FormState
} from '@gxxc/solid-forms-state/types';

export type RawFieldValue = boolean | string | undefined;

export type SelectableFieldType = 'checkbox' | 'radio' | 'select';

export type FormErrors = Record<FieldName, ErrorMessages | undefined>;

export type ElementProps<T> = Omit<JSX.InputHTMLAttributes<T>, 'value' | 'name'>;

export type CustomValidator<V> = (
  fieldName: FieldName,
  fieldValue: V,
  formState: FormState,
  setFieldErrors: (e: ErrorMessages) => void
) => void;

export interface FormFieldComponentBaseProps<V> {
  value?: V;
  defaultValue?: V;
  defaultChecked?: boolean;
  isControlled?: boolean;
  match?: FieldName;
  validator?: CustomValidator<V>;
}

export type FormElementRef = HTMLDivElement | HTMLFormElement;

export type Constraint = boolean | number | string;

export interface ConstraintConfig {
  validate: (v: FieldValue | undefined, c: Constraint | undefined, s: FormState) => boolean;
  message: (n: string, c: Constraint) => string;
}

export type FieldSetter<V> = (fieldName: FieldName, fieldValue: V) => void;
export type FormOnChangeHandler = (fieldName: FieldName, fieldValue: FieldValue) => void;
export type FieldOnChangeHandler<T = JSX.Element> = JSX.EventHandler<T, InputEvent>;
export type FieldOnBlurHandler<T = JSX.Element> = JSX.EventHandler<T, UIEvent>;

export type FormElementTag = Extract<keyof JSX.HTMLElementTags, 'button' | 'input' | 'select' | 'textarea'>;
export type FormElement<G extends FormElementTag> = HTMLElementTagNameMap[G];

export type FormFieldProps<G extends FormElementTag, V extends FieldValue> = Omit<
  JSX.HTMLElementTags[G],
  'value' | 'name' | 'label' | 'defaultValue'
> &
  FieldInternalProps<V> & {
    value?: V;
    name: FieldName;
    label?: string;
    errors?: ErrorMessages;
    defaultValue?: V;
    defaultChecked?: boolean;
    match?: FieldName;
    readonly?: boolean;
    disabled?: boolean;
    validator?: CustomValidator<V>;
    mask?: MaskFunction<V>;
  };

export interface FieldInternalProps<V> {
  isInitialized?: boolean;
  isValid?: boolean;
  isControlled?: boolean;
  isDisabled?: boolean;
  isSelectable?: boolean;
  setValue?: (value?: V, initialize?: boolean) => void;
  showIcon?: (value?: V, e?: ErrorMessages) => boolean;
  onChange?: FieldOnChangeHandler<V>;
  onBlur?: FieldOnBlurHandler;
  'data-for'?: string;
  'data-tip'?: string;
}

export type SetField = (value: string | undefined, isInitialization?: boolean) => void;
export type FormFieldEvent<E extends FormFieldElement> = FormFieldBlurEvent<E> | FormFieldInputEvent<E>;
export type AnyFormFieldEvent = FormFieldEvent<FormFieldElement>;
export type SelectableFormFieldEvent = FormFieldEvent<HTMLInputElement>;
export type FormFieldElement = HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
export type FormFieldInputEvent<E extends FormFieldElement> = Parameters<JSX.EventHandler<E, InputEvent>>[0];
export type FormFieldBlurEvent<E extends FormFieldElement> = Parameters<JSX.EventHandler<E, FocusEvent>>[0];

export interface Mask<V extends FieldValue> {
  maskedValue?: string;
  value?: V;
}

export type MaskFunction<V extends FieldValue> = (val?: string) => Mask<V>;

export type ComponentName = 'Field' | 'Button' | 'Link';
export type FormFieldComponent = JSX.Element & { componentName: ComponentName };

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
