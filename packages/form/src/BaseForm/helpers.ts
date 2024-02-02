import { type FieldValueMapping, type FormFields, type FormState, type FormStateMutations } from '@gxxc/solid-forms-state';

import {
  type BaseFormElementSubmitEvent,
  type BaseFormOnSubmit,
  type OnSubmitHandler,
  type OnSubmitHandlers,
  type RequestProps,
  type Response,
  type ResponseMapping
} from '../types';
import { type BaseFormProps } from './BaseForm';

export function isObject(o: unknown) {
  return o != null && typeof o === 'object';
}

export function isSubmitHandlerFn<P extends RequestProps, R extends Response>(
  onSubmit: unknown
): onSubmit is OnSubmitHandler<P, R> {
  return typeof onSubmit === 'function';
}

export function isSubmitHandlersObject<P extends RequestProps, R extends Response | ResponseMapping<P>>(
  onSubmit: BaseFormOnSubmit<P, R>
): onSubmit is R extends ResponseMapping<P> ? OnSubmitHandlers<P, R> : never {
  return isObject(onSubmit);
}

export function fieldsToProps<M extends FieldValueMapping>(formFields: FormFields<M>) {
  return formFields.reduce<Record<string, unknown>>((obj, field) => {
    obj[field.name] = field.value;
    return obj;
  }, {}) as M;
}

export function createBaseFormOnSubmitHandler<
  P extends RequestProps,
  R extends Response | ResponseMapping<P>
>(props: BaseFormProps<P, R>, formState: FormState, formStateMutations: FormStateMutations) {
  return (event: BaseFormElementSubmitEvent) => {
    event.preventDefault();
    const buttonName = (event.submitter as HTMLFormElement)?.name;

    if (formState.isProcessing ?? !formState.haveValuesChanged) {
      return;
    }

    const submitProps = fieldsToProps(formState.fields) as P;
    const result = isSubmitHandlerFn<P, R>(props.onSubmit)
      ? props.onSubmit(submitProps, buttonName)
      : props.onSubmit && isSubmitHandlersObject<P, R>(props.onSubmit)
        ? props.onSubmit[buttonName](submitProps, buttonName)
        : undefined;

    if (result?.then) {
      formStateMutations.setIsProcessing(true);
      result
        .then(() => {
          formStateMutations.setIsProcessing(false);
        })
        .catch((error: Error) => {
          formStateMutations.setIsProcessing(false);
          throw error;
        });
    }
  };
}
