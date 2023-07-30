import { SetStoreFunction } from 'solid-js/store';

import { ErrorMessages, FieldName, FieldValue, FormOnChangeHandler, FormState } from './types';

export type SetFormState = SetStoreFunction<FormState>;

export function createInitializeField(formState: FormState, setFormState: SetFormState) {
  return (name: string, value: any, errors: ErrorMessages) => {
    if (formState.hasFieldBeenInitialized(name) || !name) {
      return;
    }

    const newField = {
      name,
      value,
      errors,
      hasChanged: false,
      hasBeenBlurred: false,
      hasBeenValid: value !== undefined && !errors?.length
    };

    setFormState('fields', (oldFields) => [...oldFields, newField]);
  };
}

export function createSetFieldValue(formState: FormState, setFormState: SetFormState) {
  return (name: string, value: any, fieldErrors: ErrorMessages) => {
    if (formState.getFieldValue(name) === value) {
      return;
    }

    const prevErrors = formState.getFieldErrors(name);
    const hasBeenValid = formState.hasFieldBeenValid(name);
    if (!prevErrors && !hasBeenValid) {
      setFormState('fields', (f) => f.name === name, 'hasBeenValid', true);
    }

    if (fieldErrors !== prevErrors) {
      setFormState('fields', (f) => f.name === name, 'errors', fieldErrors || []);
    }

    setFormState('fields', (f) => f.name === name, 'value', value);

    if (!formState.hasFieldChanged(name)) {
      setFormState('fields', (f) => f.name === name, 'hasChanged', true);
    }
  };
}

export function createSetChangedField(setFormState: SetFormState) {
  return (name: FieldName) =>
    void setFormState('fields', (f) => f.name === name, 'hasChanged', true);
}

export function createSetBlurredField(setFormState: SetFormState) {
  return (name: FieldName) =>
    void setFormState('fields', (f) => f.name === name, 'hasBeenBlurred', true);
}

export function createSetIsProcessing(setFormState: SetFormState) {
  return (isProcessing: boolean) => void setFormState('isProcessing', isProcessing);
}
