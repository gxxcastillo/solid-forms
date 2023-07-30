import { JSX, mergeProps } from 'solid-js';

import { useFormContext } from '@gxxc/solid-forms-state';
import { constraintNames, validate } from '@gxxc/solid-forms-validation';

import type { FieldValue, ValidationConstraints } from '../types';

type SetField = (value: any, isInitialization?: boolean) => void;
type FormFieldEvent<E extends FormFieldElement> = FormFieldBlurEvent<E> | FormFieldInputEvent<E>;
type AnyFormFieldEvent = FormFieldEvent<FormFieldElement>;
type SelectableFormFieldEvent = FormFieldEvent<HTMLInputElement>;
type FormFieldElement = HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement;
type FormFieldInputEvent<E extends FormFieldElement> = Parameters<
  JSX.EventHandler<E, InputEvent>
>[0];
type FormFieldBlurEvent<E extends FormFieldElement> = Parameters<
  JSX.EventHandler<E, FocusEvent>
>[0];

export interface Mask<V = unknown> {
  unmaskedValue: V;
  value: string;
}

export const useFormFieldDefaultProps = {
  isControlled: true,
  disabled: false
};

export function deepEqual(x: any, y: any) {
  if (x === y) {
    return true;
  }
  if (typeof x === 'object' && x != null && typeof y === 'object' && y != null) {
    if (Object.keys(x).length != Object.keys(y).length) return false;

    for (const prop in x) {
      if (y.hasOwnProperty(prop)) {
        if (!deepEqual(x[prop], y[prop])) return false;
      } else return false;
    }

    return true;
  }
  return false;
}

export function pick<V = any>(obj: Record<string, V>, keys: string[]) {
  const entries = keys.flatMap<[string, V]>((key) => (key in obj ? [key, obj[key]] : []));
  return Object.fromEntries(entries);
}

export function mask<V>(val: FieldValue<V>): Mask<V> {
  return {
    unmaskedValue: val,
    value: val?.toString() ?? ''
  };
}

export function getDisplayableErrors(props: any, getters: any) {
  return getters.hasFieldBeenValid(props.name) || getters.hasFieldBlurred(props.name)
    ? getters.getFieldErrors(props.name)
    : undefined;
}

export function isSelectableEvent(
  event: AnyFormFieldEvent,
  isSelectable: boolean
): event is SelectableFormFieldEvent {
  return !!event && isSelectable;
}

export function createValueSetter(
  props: any,
  getters: any,
  setters: any,
  validationConstraints: any
) {
  return function setValue(val?: any, isInitialization = false) {
    let valueForValidation;
    let valueForDisplay;

    if ((props.disabled || props.readOnly) && !isInitialization) {
      return;
    }

    if (props.isSelectable) {
      valueForValidation = val;
      valueForDisplay = val;
    } else {
      const masked = mask(val);
      valueForValidation = masked.unmaskedValue;
      valueForDisplay = masked.value;
    }

    // Do nothing if the value didn't change
    if (
      props.isSelectable ? props.currentChecked === val : props.currentValue === valueForDisplay
    ) {
      return;
    }

    props.validator?.(
      props.name,
      valueForValidation,
      getters.fields,
      getters.getFieldErrors,
      (errors: any) => {
        const prevErrors = getters.getFieldErrors(props.name);
        if (!deepEqual(errors, prevErrors)) {
          setters.setFieldErrors(props.name, errors);
        }
      }
    );

    const newErrors = validate(
      props.name,
      valueForValidation,
      validationConstraints,
      getters.fields
    );

    const errorsForDisplay = newErrors.length > 0 ? newErrors : undefined;
    if (isInitialization) {
      setters.initializeField(props.name, valueForDisplay, errorsForDisplay);
    } else {
      setters.setFieldValue(props.name, valueForDisplay, errorsForDisplay);
    }
  };
}

export function createOnInput<E extends FormFieldElement>(setField: SetField, props: any) {
  return function onInput(event: FormFieldInputEvent<E>) {
    if (isSelectableEvent(event, props.isSelectable)) {
      setField(event.currentTarget?.checked ? event.currentTarget.value || true : false);
    } else {
      setField(event.currentTarget.value);
    }
  };
}

export function createOnBlur<E extends FormFieldElement>(
  setField: SetField,
  props: any,
  setters: any
) {
  return function onBlur(event: FormFieldBlurEvent<E>) {
    setters.setBlurredField(props.name);
    if (isSelectableEvent(event, props.isSelectable)) {
      setField(event.currentTarget.checked ? event.currentTarget.value || true : false);
    } else {
      setField(event.currentTarget.value);
    }
  };
}

export function useFormField<E extends FormFieldElement = FormFieldElement>(initialProps: any) {
  const props = mergeProps(useFormFieldDefaultProps, initialProps);
  const [getters, setters] = useFormContext();

  const { checked } = props;
  const { readOnly } = props;
  const { disabled } = props;
  const { autoFocus, innerRef, name, isLoading } = props;

  const elRef = innerRef || props.ref;
  const isSelectable = !!props.selectType;
  const isInitialized = getters.hasFieldBeenInitialized(name);
  const currentValue = getters.getFieldValue(name);
  const currentChecked = isSelectable ? checked ?? !!currentValue : undefined;
  const validationConstraints: ValidationConstraints = pick<ValidationConstraints>(
    props,
    constraintNames
  );

  const setValue = createValueSetter(props, getters, setters, validationConstraints);
  const onInput = createOnInput<E>(setValue, props);
  const onBlur = createOnBlur<E>(setValue, props, setters);

  if (props.isControlled && !isInitialized) {
    if (isSelectable) {
      setValue(props.defaultValue || props.defaultChecked, true);
    } else {
      setValue(props.defaultValue, true);
    }
  } else if (props.disabled && isInitialized) {
    if (isSelectable) {
      setValue(props.defaultValue);
    } else {
      setValue(props.defaultValue);
    }
  }

  if (autoFocus) {
    setTimeout(() => {
      elRef.current?.focus();
      // At times, there is an animation, wait a bit before setting focus
    }, 200);
  }

  return {
    ...props,
    id: name,
    value: currentValue,
    disabled: !!(disabled || isLoading),
    errors: getDisplayableErrors(props, getters),
    checked: currentChecked,
    isInitialized,
    innerRef: elRef,
    setValue,
    onInput,
    onBlur
  };
}
