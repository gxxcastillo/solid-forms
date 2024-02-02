import { type JSX } from 'solid-js';

import { type ErrorMessages, type FieldValue, type FieldValueMapping } from '@gxxc/solid-forms-state';

export type DefaultFieldValue = string;
export type FieldName = string;

export type SelectableFieldType = 'checkbox' | 'radio' | 'select';

export type FormErrors = Record<FieldName, ErrorMessages>;

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

export type FormOnChangeHandler = (fieldName: FieldName, fieldValue: FieldValue) => void;

export type FieldOnChangeHandler<T = JSX.Element> = JSX.EventHandler<T, InputEvent>;
export type FieldOnBlurHandler<T = JSX.Element> = JSX.EventHandler<T, UIEvent>;

export interface ErrorResult {
  message: string;
  code: string;
}

export type RequestProps = FieldValueMapping;
export type ErrorResults = ErrorResult[];
export type FormErrorResult = Record<string, ErrorResult>;

export type Response = object | string | [] | null | void;
export type ResponseMapping<P extends RequestProps> = Record<string, OnSubmitHandler<P, Response>>;
export type OnSubmitHandler<P extends RequestProps, R extends Response = void> = (
  props: P,
  buttonName: string
) => Promise<R> | void;

export type OnSubmitHandlers<P extends RequestProps, M extends ResponseMapping<P>> = {
  [K in keyof M]: M[K];
};

export type BaseFormOnSubmit<
  P extends RequestProps,
  R extends Response | ResponseMapping<P>
> = R extends ResponseMapping<P> ? OnSubmitHandlers<P, R> : OnSubmitHandler<P, R>;

export type BaseFormElementSubmitEvent = Event & { submitter: HTMLElement };
export type BaseFormElementOnSubmitHandler = JSX.EventHandler<HTMLFormElement, BaseFormElementSubmitEvent>;