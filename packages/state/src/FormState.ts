import { mergeProps } from 'solid-js';
import { createStore } from 'solid-js/store';
import type { StringKeyOf } from 'type-fest';

import { type BaseFormState, type FieldValueMapping, type FormField, type FormStore } from './types';

export const initialFormState = {
  fields: [],
  errors: [],
  isLoading: false,
  isProcessing: false,
  isReady: false
};

export function createFormState<M extends FieldValueMapping>(state?: BaseFormState<M>) {
  const [formState, setFormState] = createStore<BaseFormState<M>>(state ?? initialFormState);
  const getters = {
    get haveValuesChanged() {
      return !!formState.fields.some((f) => f.hasChanged);
    },
    get isFormValid() {
      return !formState.fields.some((f) => !!f.errors?.length);
    },
    getField<N extends StringKeyOf<M>>(name: N) {
      return formState.fields?.find((f): f is FormField<M, N> => f.name === name);
    },
    getFieldValue<N extends StringKeyOf<M>>(name: N) {
      return getters.getField(name)?.value;
    },
    getFieldErrors<N extends StringKeyOf<M>>(name: N) {
      return getters.getField<N>(name)?.errors;
    },
    hasFieldBeenInitialized<N extends StringKeyOf<M>>(name: N) {
      return !!getters.getField<N>(name);
    },
    hasFieldBeenValid<N extends StringKeyOf<M>>(name: N) {
      return getters.getField<N>(name)?.hasBeenValid;
    },
    hasFieldChanged<N extends StringKeyOf<M>>(name: N) {
      return getters.getField<N>(name)?.hasChanged;
    },
    hasFieldBlurred<N extends StringKeyOf<M>>(name: N) {
      return getters.getField<N>(name)?.hasBeenBlurred;
    },
    isFieldValid<N extends StringKeyOf<M>>(name: N) {
      return !getters.getField<N>(name)?.errors?.length;
    }
  };

  return [formState, getters, setFormState] as const;
}

export function createFormStore<M extends FieldValueMapping>(state?: BaseFormState<M>): FormStore<M> {
  const [formState, getters, setFormState] = createFormState<M>(state);

  type FName = StringKeyOf<M>;
  type FErrors = (typeof formState)['fields'][number]['errors'];

  return [
    mergeProps(formState, getters),
    {
      initializeField: <N extends StringKeyOf<M>>(name: N, value?: M[N], errors: FErrors = []) => {
        if (getters.hasFieldBeenInitialized(name) || !name) {
          return;
        }

        setFormState('fields', (fields) => {
          const newField = {
            name,
            value,
            errors,
            hasBeenInitialized: true,
            hasChanged: false,
            hasBeenBlurred: false,
            hasBeenValid: value !== undefined && !errors?.length
          };

          const index = fields.findIndex((field) => field.name === newField.name);
          if (index !== -1) {
            return [...fields.slice(0, index), newField, ...fields.slice(index + 1)];
          }

          return [...fields, newField];
        });
      },

      setFieldValue: <N extends FName>(name: N, value?: M[N], errors: FErrors = []) => {
        const hasBeenInitialized = getters.hasFieldBeenInitialized(name);
        if (hasBeenInitialized && getters.getFieldValue(name) === value) {
          return;
        }

        if (!hasBeenInitialized) {
          setFormState('fields', (fields) => [
            ...(fields || []),
            {
              name,
              value,
              errors: [],
              hasBeenInitialized: true,
              hasBeenValid: false,
              hasBeenBlurred: false,
              hasChanged: false
            } satisfies FormField<M, N>
          ]);

          return;
        }

        const hasBeenValid = getters.hasFieldBeenValid(name);
        const prevErrors = getters.getFieldErrors(name);

        setFormState(
          'fields',
          (f) => f.name === name,
          () => ({
            value,
            errors: errors === prevErrors ? [] : errors,
            hasBeenValid: !prevErrors && !hasBeenValid,
            hasChanged: true
          })
        );
      },
      setFieldErrors: <N extends FName>(name: N, errors?: FErrors) =>
        setFormState('fields', (f) => f.name === name, 'errors', errors ?? []),
      setChangedField: <N extends FName>(name: N) =>
        setFormState('fields', (f) => f.name === name, 'hasChanged', true),
      setBlurredField: <N extends FName>(name: N) =>
        setFormState('fields', (f) => f.name === name, 'hasBeenBlurred', true),
      setIsReady: (isReady: boolean) => setFormState('isReady', isReady),
      setIsLoading: (isLoading: boolean) => setFormState('isLoading', isLoading),
      setIsProcessing: (isProcessing: boolean) => setFormState('isProcessing', isProcessing)
    }
  ] as const;
}
