import { type JSX, createMemo, mergeProps, splitProps } from 'solid-js';
import { type StringKeyOf } from 'type-fest';

import {
  DisplayValue,
  type FieldName,
  FieldValue,
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
  SetValue
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

export function parse<V>(val: DisplayValue) {
  return val as V;
}

export function format<V extends FieldValue>(val: V | undefined) {
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
  return function setValue(val?: DisplayValue, isInitialization = false) {
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
>(setValue: SetValue, props: FormFieldProps<G, M, N>) {
  return function onInput(event: FormFieldInputEvent<HTMLElementTagNameMap[G]>) {
    if (isSelectableEvent(event, !!props.isSelectable)) {
      setValue(event.currentTarget?.checked ? event.currentTarget.value || 'true' : 'false');
    } else {
      setValue(event.currentTarget.value);
    }
  };
}

export function createOnBlur<G extends FormElementTag, M extends FieldValueMapping, N extends StringKeyOf<M>>(
  setField: SetValue,
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

export function createField(componentName: ComponentName, el: JSX.Element) {
  const fieldElement = el as FormFieldComponent;
  fieldElement.componentName = componentName;
  return fieldElement;
}

export function useFormField<G extends FormElementTag, M extends FieldValueMapping, N extends StringKeyOf<M>>(
  initialProps: FormFieldProps<G, M, N>
) {
  const props = mergeProps(useFormFieldDefaultProps, initialProps);
  const [formState, formStateMutations] = useFormContext<M>();

  const { isLoading } = formState;

  const isSelectable = props.checked !== undefined;
  const isInitialized = formState.hasFieldBeenInitialized(props.name);
  const value = createMemo(() => formState.getFieldValue(props.name));
  const currentChecked = isSelectable ? props.checked ?? !!value : undefined;
  const [validationConstraints] = splitProps(props, constraintNames);

  const setValue = createValueSetter<G, M, N, typeof validationConstraints>(
    value(),
    currentChecked,
    formState,
    formStateMutations,
    validationConstraints,
    props
  );
  const onInput = createOnInput<G, M, N>(setValue, initialProps);
  const onBlur = createOnBlur<G, M, N>(setValue, initialProps, formStateMutations.setBlurredField);

  if (props.isControlled && !isInitialized) {
    formStateMutations.setFieldValue(props.name, props.defaultValue);
  } else if (props.disabled && isInitialized) {
    if (isSelectable) {
      formStateMutations.setFieldValue(props.name, props.defaultValue);
    } else {
      formStateMutations.setFieldValue(props.name, props.defaultValue);
    }
  }

  const formattedValue = createMemo(() => props.format(value()));

  const newProps = mergeProps(props, {
    id: props.name,
    value: formattedValue(),
    disabled: !!(!props.name || isLoading),
    errors: getDisplayableErrors(props.name, formState),
    checked: currentChecked,
    isInitialized,
    setValue,
    onInput,
    onBlur
  });

  return [newProps, createField] as const;
}
