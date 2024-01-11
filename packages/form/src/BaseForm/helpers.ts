import { FormFields, FormState, FormStateMutations } from '@gxxc/solid-forms-state';

import { BaseFormElementSubmitEvent, OnSubmitHandler, OnSubmitHandlers, RequestProps } from '../types';
import { BaseFormProps } from './BaseForm';

export function isObject(o: unknown) {
  return o != null && typeof o === 'object';
}

export function isSubmitHandlerFn(onSubmit: unknown): onSubmit is OnSubmitHandler {
  return typeof onSubmit === 'function';
}

export function isSubmitHandlersObject(onSubmit: unknown): onSubmit is OnSubmitHandlers {
  return isObject(onSubmit);
}

export function fieldsToProps<M extends Record<string, unknown>>(formFields: FormFields<M>) {
  return formFields.reduce<RequestProps>((obj, field) => {
    obj[field.name] = field.value as string | null | undefined;
    return obj;
  }, {});
}

export function createBaseFormOnSubmitHandler(
  props: BaseFormProps,
  formState: FormState,
  formStateMutations: FormStateMutations
) {
  return (event: BaseFormElementSubmitEvent) => {
    event.preventDefault();
    const buttonName = (event.submitter as HTMLFormElement)?.name;

    if (formState.isProcessing || !formState.haveValuesChanged) {
      return;
    }

    const submitProps = fieldsToProps(formState.fields);
    const result = isSubmitHandlerFn(props.onSubmit)
      ? props.onSubmit(submitProps, buttonName)
      : isSubmitHandlersObject(props.onSubmit)
        ? props.onSubmit[buttonName](submitProps, buttonName)
        : undefined;

    if (result && result.then) {
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
