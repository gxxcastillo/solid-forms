import { type JSX } from 'solid-js';

import { type ErrorMessages, type FieldName, type FieldValueMapping } from '@gxxc/solid-forms-state';

export type FormErrors = Record<FieldName, ErrorMessages>;

export type ErrorResult = {
  message: string;
  code: string;
};

export type RequestProps = FieldValueMapping;

export type Response = object | string | [] | null | void;
export type ResponseMapping<P extends RequestProps> = Record<string, OnSubmitHandler<P, Response>>;
export type OnSubmitHandler<P extends RequestProps, R extends Response = void> = (
  props: P,
  buttonName: string
) => Promise<R> | void;

export type OnSubmitHandlers<P extends RequestProps, M extends ResponseMapping<P>> = {
  [K in keyof M]: M[K];
};

export type BaseFormOnSubmit<P extends RequestProps, R extends Response | ResponseMapping<P>> =
  R extends ResponseMapping<P> ? OnSubmitHandlers<P, R> : OnSubmitHandler<P, R>;

export type BaseFormElementSubmitEvent = Event & { submitter: HTMLElement };
export type BaseFormElementOnSubmitHandler = JSX.EventHandler<HTMLFormElement, BaseFormElementSubmitEvent>;
