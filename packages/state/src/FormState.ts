import { createStore } from 'solid-js/store';

import {
  createInitializeField,
  createSetBlurredField,
  createSetChangedField,
  createSetFieldValue,
  createSetIsProcessing
} from './FormContextSetters';
import { FieldName, FormOnChangeHandler, FormState } from './types';

export const initialFormState: FormState = {
  fields: [],
  isLoading: false,
  isProcessing: false,
  isReady: false,
  get haveValuesChanged() {
    return !!initialFormState.fields.some((f) => f.hasChanged);
  },
  get isFormValid() {
    return !!initialFormState.fields.find((f) => !!f.errors?.length);
  },
  getField: (name: FieldName) => initialFormState.fields?.find((f) => f.name === name),
  getFieldValue(name: FieldName) {
    return initialFormState.getField(name)?.value;
  },
  getFieldErrors(name: FieldName) {
    return initialFormState.getField(name)?.errors;
  },
  hasFieldBeenInitialized(name: FieldName) {
    return !!initialFormState.getField(name);
  },
  hasFieldBeenValid(name: FieldName) {
    return initialFormState.getField(name)?.hasBeenValid;
  },
  hasFieldChanged(name: FieldName) {
    return initialFormState.getField(name)?.hasChanged;
  },
  hasFieldBlurred(name: FieldName) {
    return initialFormState.getField(name)?.hasBeenBlurred;
  },
  isFieldValid(name: FieldName) {
    return !initialFormState.getField(name)?.errors?.length;
  }
};

export function createFormState() {
  const [formState, setFormState] = createStore(initialFormState);

  return [
    formState,
    {
      initializeField: createInitializeField(formState, setFormState),
      setFieldValue: createSetFieldValue(formState, setFormState),
      setChangedField: createSetChangedField(setFormState),
      setBlurredField: createSetBlurredField(setFormState),
      setIsProcessing: createSetIsProcessing(setFormState)
    }
  ] as const;
}
