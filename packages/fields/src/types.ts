import { type JSX } from 'solid-js';
import { type StringKeyOf } from 'type-fest';

import {
  type DisplayValue,
  type ErrorMessages,
  type FieldValue,
  type FieldValueMapping,
  type FormState
} from '@gxxc/solid-forms-state';
import { type ValidationConstraints } from '@gxxc/solid-forms-validation';

export type RawFieldValue = boolean | string | undefined;

export type ElementProps<T> = Omit<JSX.InputHTMLAttributes<T>, 'value' | 'name'>;

export type CustomValidator<M extends FieldValueMapping, N extends StringKeyOf<M>> = (
  fieldName: N,
  fieldValue: M[N],
  formState: FormState,
  setFieldErrors: (e: ErrorMessages) => void
) => void;

export type Constraint = boolean | number | string;

export type FormElementTag = 'button' | 'input' | 'select' | 'textarea';
export type FormElement<G extends FormElementTag> = HTMLElementTagNameMap[G];

export type BaseFormFieldProps<G extends FormElementTag> = Omit<JSX.HTMLElementTags[G], 'name' | 'label'>;

export type FieldProps<M extends FieldValueMapping, N extends StringKeyOf<M>> = {
  name: N;
  label?: string;
  defaultValue?: M[N];
  defaultChecked?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  checked?: boolean;
};

export type FieldInternalProps<M extends FieldValueMapping, N extends StringKeyOf<M>> = {
  isInitialized?: boolean;
  isValid?: boolean;
  isControlled?: boolean;
  isDisabled?: boolean;
  isSelectable?: boolean;
  errors?: ErrorMessages;
  match?: Omit<StringKeyOf<M>, N>;
  setValue?: (value?: M[N], initialize?: boolean) => void;
  showIcon?: (value?: M[N], e?: ErrorMessages) => boolean;
  validator?: CustomValidator<M, N>;
  parse?: ParseFunction<M[N]>;
  format?: FormatFunction<M[N]>;
};

export type FormFieldProps<
  G extends FormElementTag,
  M extends FieldValueMapping,
  N extends StringKeyOf<M>
> = BaseFormFieldProps<G> & FieldProps<M, N> & FieldInternalProps<M, N> & ValidationConstraints;

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
