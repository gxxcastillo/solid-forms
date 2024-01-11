import { createStore } from 'solid-js/store';
import type { StringKeyOf } from 'type-fest';

import { BaseFormState, ErrorMessages, FieldName, FieldValueMapping } from './types';

export const initialFormState: BaseFormState = {
  fields: [],
  errors: [],
  isLoading: false,
  isProcessing: false,
  isReady: false
};

export function createFormState<M extends FieldValueMapping>(state?: BaseFormState<M>) {
  const [formState, setFormState] = createStore<BaseFormState<M>>(
    state ?? (initialFormState as BaseFormState<M>)
  );

  const getters = {
    get haveValuesChanged() {
      return !!formState.fields.some((f) => f.hasChanged);
    },
    get isFormValid() {
      return !!formState.fields.some((f) => !!f.errors?.length);
    },
    getField: (name: FieldName) => formState.fields?.find((f) => f.name === name),
    getFieldValue<V>(name: FieldName) {
      return getters.getField(name)?.value as V;
    },
    getFieldErrors(name: FieldName) {
      return getters.getField(name)?.errors;
    },
    hasFieldBeenInitialized(name: FieldName) {
      return !!getters.getField(name);
    },
    hasFieldBeenValid(name: FieldName) {
      return getters.getField(name)?.hasBeenValid;
    },
    hasFieldChanged(name: FieldName) {
      return getters.getField(name)?.hasChanged;
    },
    hasFieldBlurred(name: FieldName) {
      return getters.getField(name)?.hasBeenBlurred;
    },
    isFieldValid(name: FieldName) {
      return !getters.getField(name)?.errors?.length;
    }
  };

  return [formState, getters, setFormState] as const;
}

export function createFormStore<M extends FieldValueMapping>(state?: BaseFormState<M>) {
  const [formState, getters, setFormState] = createFormState(state);

  type FName = StringKeyOf<M>;
  type FValue = (typeof formState)['fields'][number]['value'];
  type FErrors = (typeof formState)['fields'][number]['errors'];

  return [
    { ...formState, ...getters },
    {
      initializeField: (name: FName, value: FValue, errors: FErrors = []) => {
        if (getters.hasFieldBeenInitialized(name) || !name) {
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
      },

      setFieldValue: (name: FName, value: FValue, errors: FErrors = []) => {
        const hasBeenInitialized = getters.hasFieldBeenInitialized(name);
        if (hasBeenInitialized && getters.getFieldValue(name) === value) {
          return;
        }

        if (!hasBeenInitialized) {
          setFormState('fields', (f) => [
            ...(f || []),
            {
              name,
              value,
              errors: [],
              hasBeenInitialized: true,
              hasBeenValid: false,
              hasBeenBlurred: false,
              hasChanged: false
            }
          ]);

          return;
        }

        const hasBeenValid = getters.hasFieldBeenValid(name);
        const prevErrors = getters.getFieldErrors(name);
        if (!prevErrors && !hasBeenValid) {
          setFormState('fields', (f) => f.name === name, 'hasBeenValid', true);
        }

        if (errors !== prevErrors) {
          setFormState('fields', (f) => f.name === name, 'errors', errors || []);
        }

        setFormState('fields', (f) => f.name === name, 'value', value);

        if (!getters.hasFieldChanged(name)) {
          setFormState('fields', (f) => f.name === name, 'hasChanged', true);
        }
      },
      setFieldErrors: (name: FName, errors: FErrors) =>
        setFormState('fields', (f) => f.name === name, 'errors', errors),
      setChangedField: (name: FName) => setFormState('fields', (f) => f.name === name, 'hasChanged', true),
      setBlurredField: (name: FName) =>
        setFormState('fields', (f) => f.name === name, 'hasBeenBlurred', true),
      setErrors: (errors: ErrorMessages) => setFormState('errors', errors),
      setIsReady: (isReady: boolean) => setFormState('isReady', isReady),
      setIsLoading: (isLoading: boolean) => setFormState('isLoading', isLoading),
      setIsProcessing: (isProcessing: boolean) => setFormState('isProcessing', isProcessing)
    }
  ] as const;
}
