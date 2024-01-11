import { type JSX, mergeProps } from 'solid-js';
import { type StringKeyOf } from 'type-fest';

import {
  type FieldName,
  type FieldValue,
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
  mask,
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

export function pick<V = unknown>(obj: Record<string, V>, keys: string[]) {
  const entries = keys.flatMap<[string, V]>((key) => (key in obj ? [key, obj[key]] : []));
  return Object.fromEntries(entries);
}

// @TODO This is an example of a masking function. Something similar would need to be implemented per input when / if needed
export function mask(val: FieldValue) {
  return {
    maskedValue: val?.toString() ?? '',
    value: val
  };
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
  F extends FormState,
  U extends FormStateMutations<M>,
  C extends ValidationConstraints,
  M extends FieldValueMapping,
  G extends FormElementTag,
  V extends M[StringKeyOf<M>]
>(
  currentValue: V,
  currentChecked: boolean | undefined,
  formState: F,
  formStateMutations: U,
  validationConstraints: C,
  props: FormFieldProps<G, V>
) {
  return function setValue(val?: string, isInitialization = false) {
    type FName = StringKeyOf<M>;

    let valueForValidation: V;
    let valueForDisplay;

    if ((props.disabled ?? props.readonly) && !isInitialization) {
      return;
    }

    if (props.isSelectable) {
      valueForValidation = val as V;
      valueForDisplay = val;

      if (currentChecked === val) {
        return;
      }
    } else if (typeof props.mask === 'function') {
      const masked = props.mask(val);
      valueForValidation = masked.value!;
      valueForDisplay = masked.maskedValue;

      if (currentValue === valueForDisplay) {
        return;
      }
    } else {
      // There should always be a mask
      return;
    }

    const name = props.name as FName;
    const newErrors = validate(props.name, valueForValidation, validationConstraints, formState);

    const errorsForDisplay = newErrors.length > 0 ? newErrors : undefined;
    if (isInitialization) {
      formStateMutations.initializeField(name, valueForValidation, errorsForDisplay);
    } else {
      formStateMutations.setFieldValue(name, valueForValidation, errorsForDisplay);
    }
  };
}

export function createOnInput<G extends FormElementTag, V extends FieldValue>(
  setField: SetField,
  props: FormFieldProps<G, V>
) {
  return function onInput(event: FormFieldInputEvent<HTMLElementTagNameMap[G]>) {
    if (isSelectableEvent(event, !!props.isSelectable)) {
      setField(event.currentTarget?.checked ? event.currentTarget.value || 'true' : 'false');
    } else {
      setField(event.currentTarget.value);
    }
  };
}

export function createOnBlur<G extends FormElementTag, V extends FieldValue>(
  setField: SetField,
  props: FormFieldProps<G, V>,
  setBlurredField: (name: string) => void
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

export function useFormField<G extends FormElementTag, V extends FieldValue>(
  initialProps: FormFieldProps<G, V>
) {
  const { checked } = initialProps as JSX.InputHTMLAttributes<HTMLInputElement>;
  const { disabled, name } = initialProps;

  const props = mergeProps(useFormFieldDefaultProps, initialProps);
  const [formState, formStateMutations] = useFormContext();

  const { isLoading } = formState;

  const isSelectable = checked !== undefined;
  const isInitialized = formState.hasFieldBeenInitialized(name);
  const storeValue = formState.getFieldValue(name) as V;
  const displayValue = props.mask?.(storeValue).maskedValue;
  const currentChecked = isSelectable ? checked ?? !!displayValue : undefined;
  const validationConstraints: ValidationConstraints = pick(props, constraintNames);

  type FState = typeof formState;
  type FValueMapping = Record<FState['fields'][number]['name'], FState['fields'][number]['value']>;
  const setValue = createValueSetter<
    FState,
    typeof formStateMutations,
    typeof validationConstraints,
    FValueMapping,
    G,
    V
  >(storeValue, currentChecked, formState, formStateMutations, validationConstraints, props);
  const onInput = createOnInput<G, V>(setValue, props);
  const onBlur = createOnBlur<G, V>(setValue, props, formStateMutations.setBlurredField);

  if (props.isControlled && !isInitialized) {
    if (isSelectable) {
      formStateMutations.setFieldValue(name, props.defaultValue ?? props.defaultChecked);
    } else {
      formStateMutations.setFieldValue(name, props.defaultValue);
    }
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
      value: displayValue,
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
