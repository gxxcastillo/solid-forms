import { type JSX, mergeProps, splitProps } from 'solid-js';
import { type StringKeyOf } from 'type-fest';

import {
  type FieldName,
  FieldValueMapping,
  FormState,
  FormStateMutations,
  useFormContext
} from '@gxxc/solid-forms-state';
import { ValidationConstraints, constraintNames, validate } from '@gxxc/solid-forms-validation';

import type {
  AnyFormFieldEvent,
  ComponentName,
  FormElementTag,
  FormFieldBlurEvent,
  FormFieldComponent,
  FormFieldInputEvent,
  FormFieldProps,
  SelectableFormFieldEvent,
  SetField
} from '../types';

export const useFormFieldDefaultProps = {
  parse,
  format,
  isControlled: true,
  disabled: false
};

export function deepEqual(x: unknown, y: unknown) {
  if (x === y) {
    return true;
  }
  if (typeof x === 'object' && x != null && typeof y === 'object' && y != null) {
    if (Object.keys(x).length !== Object.keys(y).length) return false;

    for (const prop in x) {
      if (Object.hasOwn(y, prop)) {
        if (!deepEqual((x as Record<string, unknown>)[prop], (y as Record<string, unknown>)[prop]))
          return false;
      } else return false;
    }

    return true;
  }
  return false;
}

// @TODO This is an example of a parsing function. Something similar would need to be implemented per input when / if needed
export function parse<V>(val: string | undefined) {
  return val as V;
}

// @TODO This is an example of a formatting function. Something similar would need to be implemented per input when / if needed
export function format<V>(val: V | undefined) {
  return val?.toString() ?? '';
}

export function getDisplayableErrors<K extends FieldName>(
  fieldName: K,
  { hasFieldBeenValid, hasFieldBlurred, getFieldErrors }: FormState
) {
  return hasFieldBeenValid(fieldName) ?? hasFieldBlurred(fieldName) ? getFieldErrors(fieldName) : undefined;
}

export function isSelectableEvent(
  event: AnyFormFieldEvent,
  isSelectable: boolean
): event is SelectableFormFieldEvent {
  return !!event && isSelectable;
}

export function createValueSetter<
  G extends FormElementTag,
  M extends FieldValueMapping,
  N extends StringKeyOf<M>,
  C extends ValidationConstraints
>(
  currentValue: M[N] | undefined,
  currentChecked: boolean | undefined,
  formState: FormState<M>,
  formStateMutations: FormStateMutations<M>,
  validationConstraints: C,
  props: FormFieldProps<G, M, N>
) {
  return function setValue(val?: string, isInitialization = false) {
    let value: M[N];

    if ((props.disabled ?? props.readonly) && !isInitialization) {
      return;
    }

    if (props.isSelectable) {
      if (currentChecked === val) {
        return;
      }

      value = val as M[N];
    } else if (typeof props.parse === 'function') {
      value = props.parse(val);

      if (currentValue === value) {
        return;
      }
    } else {
      // There should always be a parser
      return;
    }

    const name = props.name as N;
    const newErrors = validate(name, value, validationConstraints, formState);

    const errorsForDisplay = newErrors.length > 0 ? newErrors : undefined;
    if (isInitialization) {
      formStateMutations.initializeField(name, value, errorsForDisplay);
    } else {
      formStateMutations.setFieldValue(name, value, errorsForDisplay);
    }
  };
}

export function createOnInput<
  G extends FormElementTag,
  M extends FieldValueMapping,
  N extends StringKeyOf<M>
>(setField: SetField, props: FormFieldProps<G, M, N>) {
  return function onInput(event: FormFieldInputEvent<HTMLElementTagNameMap[G]>) {
    if (isSelectableEvent(event, !!props.isSelectable)) {
      setField(event.currentTarget?.checked ? event.currentTarget.value || 'true' : 'false');
    } else {
      setField(event.currentTarget.value);
    }
  };
}

export function createOnBlur<G extends FormElementTag, M extends FieldValueMapping, N extends StringKeyOf<M>>(
  setField: SetField,
  props: FormFieldProps<G, M, N>,
  setBlurredField: (name: N) => void
) {
  return function onBlur(event: FormFieldBlurEvent<HTMLElementTagNameMap[G]>) {
    setBlurredField(props.name);
    if (isSelectableEvent(event, !!props.isSelectable)) {
      setField(event.currentTarget.checked ? event.currentTarget.value || 'true' : 'false');
    } else {
      setField(event.currentTarget.value);
    }
  };
}

export function useFormField<G extends FormElementTag, M extends FieldValueMapping, N extends StringKeyOf<M>>(
  initialProps: FormFieldProps<G, M, N>
) {
  const { checked } = initialProps as JSX.InputHTMLAttributes<HTMLInputElement>;
  const { disabled, name } = initialProps;

  const props = mergeProps(useFormFieldDefaultProps, initialProps);
  const [formState, formStateMutations] = useFormContext<M>();

  const { isLoading } = formState;

  const isSelectable = checked !== undefined;
  const isInitialized = formState.hasFieldBeenInitialized(name);
  const value = formState.getFieldValue(name);
  const currentChecked = isSelectable ? checked ?? !!value : undefined;
  const [validationConstraints] = splitProps(props, constraintNames);

  const setValue = createValueSetter<G, M, N, typeof validationConstraints>(
    value,
    currentChecked,
    formState,
    formStateMutations,
    validationConstraints,
    props
  );
  const onInput = createOnInput<G, M, N>(setValue, props);
  const onBlur = createOnBlur<G, M, N>(setValue, props, formStateMutations.setBlurredField);

  if (props.isControlled && !isInitialized) {
    formStateMutations.setFieldValue(name, props.defaultValue);
  } else if (props.disabled && isInitialized) {
    if (isSelectable) {
      formStateMutations.setFieldValue(name, props.defaultValue);
    } else {
      formStateMutations.setFieldValue(name, props.defaultValue);
    }
  }

  function createField(componentName: ComponentName, el: JSX.Element) {
    const fieldElement = el as FormFieldComponent;
    fieldElement.componentName = componentName;
    return fieldElement;
  }

  return [
    createField,
    {
      ...props,
      id: name,
      value: props.format(value),
      disabled: !!(disabled ?? isLoading),
      errors: getDisplayableErrors(name, formState),
      checked: currentChecked,
      isInitialized,
      setValue,
      onInput,
      onBlur
    }
  ] as const;
}
