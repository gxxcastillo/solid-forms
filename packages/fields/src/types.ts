import { type JSX } from 'solid-js';
import { StringKeyOf } from 'type-fest';

import {
  type DisplayValue,
  type ErrorMessages,
  type FieldName,
  type FieldValue,
  type FieldValueMapping,
  type FormState
} from '@gxxc/solid-forms-state/types';
import { type ValidationConstraints } from '@gxxc/solid-forms-validation';

export type RawFieldValue = boolean | string | undefined;

export type SelectableFieldType = 'checkbox' | 'radio' | 'select';

export type FormErrors = Record<FieldName, ErrorMessages>;

export type ElementProps<T> = Omit<JSX.InputHTMLAttributes<T>, 'value' | 'name'>;

export type CustomValidator<M extends FieldValueMapping, N extends StringKeyOf<M>> = (
  fieldName: N,
  fieldValue: M[N],
  formState: FormState,
  setFieldErrors: (e: ErrorMessages) => void
) => void;

// export interface FormFieldComponentBaseProps<V> {
//   value?: V;
//   defaultValue?: V;
//   defaultChecked?: boolean;
//   isControlled?: boolean;
//   match?: FieldName;
//   validator?: CustomValidator<V>;
// }

export type FormElementRef = HTMLDivElement | HTMLFormElement;

export type Constraint = boolean | number | string;

export interface ConstraintConfig {
  validate: (v: FieldValue | undefined, c: Constraint | undefined, s: FormState) => boolean;
  message: (n: string, c: Constraint) => string;
}

export type FormOnChangeHandler = (fieldName: FieldName, fieldValue: FieldValue) => void;
export type FieldOnChangeHandler<T = JSX.Element> = JSX.EventHandler<T, InputEvent>;
export type FieldOnBlurHandler<T = JSX.Element> = JSX.EventHandler<T, UIEvent>;

export type FormElementTag = Extract<keyof JSX.HTMLElementTags, 'button' | 'input' | 'select' | 'textarea'>;
export type FormElement<G extends FormElementTag> = HTMLElementTagNameMap[G];

export type FormFieldProps<
  G extends FormElementTag,
  M extends FieldValueMapping,
  N extends StringKeyOf<M>
> = Omit<JSX.HTMLElementTags[G], 'name' | 'label' | 'defaultValue'> &
  FieldInternalProps<M[N]> &
  ValidationConstraints & {
    name: N;
    label?: string;
    errors?: ErrorMessages;
    defaultValue?: M[N];
    defaultChecked?: boolean;
    match?: Omit<StringKeyOf<M>, N>;
    readonly?: boolean;
    disabled?: boolean;
    checked?: boolean;
    validator?: CustomValidator<M, N>;
    parse?: ParseFunction<M[N]>;
    format?: FormatFunction<M[N]>;
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

export type SetValue = (value: DisplayValue, isInitialization?: boolean) => void;
export type AnyFormFieldEvent = FormFieldEvent<FormFieldElement>;
export type SelectableFormFieldEvent = FormFieldEvent<HTMLInputElement>;
export type FormFieldEvent<E extends FormFieldElement> = FormFieldBlurEvent<E> | FormFieldInputEvent<E>;
export type FormFieldElement = HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
export type FormFieldInputEvent<E extends FormFieldElement> = Parameters<JSX.EventHandler<E, InputEvent>>[0];
export type FormFieldBlurEvent<E extends FormFieldElement> = Parameters<JSX.EventHandler<E, FocusEvent>>[0];

export type ParseFunction<V extends FieldValue> = (val: DisplayValue) => V;
export type FormatFunction<V extends FieldValue> = (val: V | undefined) => string;

export type ComponentName = `${string}${'Field' | 'Button' | 'Link'}`;
export type FormFieldComponent = JSX.Element & { componentName: ComponentName };
