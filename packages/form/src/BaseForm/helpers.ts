import { JSX } from 'solid-js';

import { FormField } from '../types';

export type OnSubmitHandler = (formFields: FormField[], buttonName: string) => Promise<any> | void;

export type OnSubmitHandlers = Record<string, OnSubmitHandler>;

export type BaseFormOnSubmit = OnSubmitHandler | OnSubmitHandlers;

export type BaseFormElementSubmitEvent = Event & { submitter: HTMLElement };
export type BaseFormElementOnSubmitHandler = JSX.EventHandler<
  HTMLFormElement,
  BaseFormElementSubmitEvent
>;

export function isObject(o: unknown) {
  return o != null && typeof o === 'object';
}

export function isSubmitHandler(onSubmit: unknown): onSubmit is OnSubmitHandler {
  return typeof onSubmit === 'function';
}

export function isSubmitHandlersObject(onSubmit: unknown): onSubmit is OnSubmitHandlers {
  return isObject(onSubmit);
}

export interface CreateBaseFormOnSubmitHandlerProps {
  isProcessing: boolean;
  fields: FormField[];
  onSubmit: any; // @TODO
  haveValuesChanged: () => boolean;
  setIsProcessing: (b: boolean) => void;
}

export function createBaseFormOnSubmitHandler(props: any, formState: any, formStateMutations: any) {
  return (event: BaseFormElementSubmitEvent) => {
    event.preventDefault();
    const buttonName = (event.submitter as HTMLFormElement)?.name;

    if (formState.isProcessing || !formState.haveValuesChanged) {
      return;
    }

    const result = isSubmitHandler(props.onSubmit)
      ? props.onSubmit(formState.fields, buttonName)
      : isSubmitHandlersObject(props.onSubmit)
      ? props.onSubmit[buttonName](formState.fields, buttonName)
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
