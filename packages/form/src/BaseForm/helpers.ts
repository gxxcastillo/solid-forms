import {
  type FieldValueMapping,
  type FormFields,
  type FormState,
  type FormStateMutations
} from '@gxxc/solid-forms-state';

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

export function resolveSubmitHandler<P extends RequestProps, R extends Response | ResponseMapping<P>>(
  onSubmit: BaseFormOnSubmit<P, R> | undefined,
  buttonName: string | undefined
): OnSubmitHandler<P, R> | undefined {
  if (isSubmitHandlerFn<P, R>(onSubmit)) return onSubmit;
  if (!onSubmit || !isSubmitHandlersObject<P, R>(onSubmit)) return undefined;

  const handlers = onSubmit as unknown as Record<string, OnSubmitHandler<P, R>>;
  const matched = buttonName ? handlers[buttonName] : undefined;
  if (matched) return matched;

  // No named submitter (e.g. the form was submitted via the Enter key) or an
  // unmatched name. If the map has a single handler it is unambiguous, so use it
  // rather than silently doing nothing; with multiple handlers we can't guess.
  const handlerList = Object.values(handlers);
  return handlerList.length === 1 ? handlerList[0] : undefined;
}

export function getSubmitErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function createBaseFormOnSubmitHandler<
  P extends RequestProps,
  R extends Response | ResponseMapping<P>
>(props: BaseFormProps<P, R>, formState: FormState, formStateMutations: FormStateMutations) {
  return async (event: BaseFormElementSubmitEvent) => {
    event.preventDefault();
    const buttonName = (event.submitter as HTMLButtonElement)?.name;

    if (formState.isProcessing) {
      return;
    }

    if (!formState.isFormValid) {
      // Nothing may have been touched yet (e.g. a pristine required field), so
      // an invalid submit attempt must mark every field blurred to make its
      // errors visible instead of silently doing nothing.
      for (const field of formState.fields) {
        formStateMutations.setBlurredField(field.name);
      }
      return;
    }

    const submitProps = fieldsToProps(formState.fields) as P;
    const onSubmitFn = resolveSubmitHandler<P, R>(props.onSubmit, buttonName);

    if (!onSubmitFn) return;

    // Set the processing flag before invoking the handler so a rapid second
    // submit cannot slip past the guard while the first is still awaited.
    formStateMutations.setIsProcessing(true);
    formStateMutations.setErrors([]);
    try {
      const result = onSubmitFn(submitProps, buttonName);
      if (result?.then) {
        await result;
      }
    } catch (error) {
      formStateMutations.setErrors([getSubmitErrorMessage(error)]);
    } finally {
      // Always clear the processing flag, even when the handler throws/rejects.
      formStateMutations.setIsProcessing(false);
    }
  };
}
