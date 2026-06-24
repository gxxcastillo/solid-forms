import { mergeProps } from 'solid-js';
import { createStore } from 'solid-js/store';
import type { StringKeyOf } from 'type-fest';

import { type BaseFormState, type FieldValueMapping, type FormField, type FormStore } from './types';

function arraysEqual<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

export const initialFormState = {
  fields: [],
  errors: [],
  isLoading: false,
  isProcessing: false,
  isReady: false
};

export function createFormState<M extends FieldValueMapping>(state?: BaseFormState<M>) {
  // Create a fresh object each call so multiple stores don't share the same backing state.
  // In SolidJS's server/SSR build, createStore returns the raw object and mutates it in place,
  // meaning two calls with the same object reference would share reactive state.
  const [formState, setFormState] = createStore<BaseFormState<M>>(
    state ?? ({ ...initialFormState, fields: [], errors: [] } as BaseFormState<M>)
  );
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
      const field = getters.getField<N>(name);
      if (!field) return undefined;
      return !field.errors?.length;
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

        setFormState('fields', (fields) => [
          ...fields,
          {
            name,
            value,
            errors,
            hasBeenInitialized: true,
            hasChanged: false,
            hasBeenBlurred: false,
            hasBeenValid: !errors.length
          }
        ]);
      },

      setFieldValue: <N extends FName>(name: N, value?: M[N], errors?: FErrors) => {
        const hasBeenInitialized = getters.hasFieldBeenInitialized(name);

        if (!hasBeenInitialized) {
          const initialErrors = errors ?? [];
          setFormState('fields', (fields) => [
            ...(fields || []),
            {
              name,
              value,
              errors: initialErrors,
              hasBeenInitialized: true,
              hasBeenValid: value !== undefined && !initialErrors.length,
              hasBeenBlurred: false,
              hasChanged: false
            } satisfies FormField<M, N>
          ]);
          return;
        }

        const currentValue = getters.getFieldValue(name);
        const currentErrors = getters.getFieldErrors(name) ?? [];
        // When errors is not explicitly provided, preserve current errors rather than clearing them.
        const effectiveErrors = errors !== undefined ? errors : currentErrors;

        if (currentValue === value && arraysEqual(effectiveErrors, currentErrors)) {
          return;
        }

        const prevHasBeenValid = getters.hasFieldBeenValid(name) ?? false;
        const prevHasChanged = getters.hasFieldChanged(name) ?? false;

        setFormState(
          'fields',
          (f) => f.name === name,
          () => ({
            value,
            errors: effectiveErrors,
            hasBeenValid: prevHasBeenValid || !effectiveErrors.length,
            hasChanged: prevHasChanged || currentValue !== value
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
