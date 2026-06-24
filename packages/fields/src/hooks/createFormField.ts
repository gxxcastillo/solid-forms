import { type JSX, createMemo, mergeProps, splitProps } from 'solid-js';
import { type StringKeyOf } from 'type-fest';

import {
  type DisplayValue,
  type FieldName,
  type FieldValue,
  type FieldValueMapping,
  type FormState,
  type FormStateMutations,
  useFormContext
} from '@gxxc/solid-forms-state';
import { type ValidationConstraints, constraintNames, validate } from '@gxxc/solid-forms-validation';

import type {
  AnyFormFieldEvent,
  ComponentName,
  FormElementTag,
  FormFieldBlurEvent,
  FormFieldInputEvent,
  FormFieldProps,
  SelectableFormFieldEvent,
  SetValue
} from '../types';

export const formFieldDefaultProps = {
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
  return (hasFieldBeenValid(fieldName) ?? hasFieldBlurred(fieldName)) ? getFieldErrors(fieldName) : undefined;
}

export function isSelectableEvent(
  event: AnyFormFieldEvent,
  isSelectable: boolean
): event is SelectableFormFieldEvent {
  return !!event && isSelectable;
}

const componentNameRegistryKey = Symbol.for('@gxxc/solid-forms/component-name-registry');

function getComponentNameRegistry() {
  const registryGlobal = globalThis as unknown as Record<symbol, WeakMap<object, ComponentName> | undefined>;
  registryGlobal[componentNameRegistryKey] ??= new WeakMap<object, ComponentName>();
  return registryGlobal[componentNameRegistryKey];
}

export function createValueSetter<
  G extends FormElementTag,
  M extends FieldValueMapping,
  N extends StringKeyOf<M>,
  C extends ValidationConstraints
>(
  formState: FormState<M>,
  formStateMutations: FormStateMutations<M>,
  validationConstraints: C,
  props: FormFieldProps<G, M, N>
) {
  return function setValue(val?: FieldValue, isInitialization = false) {
    let value: M[N];
    const name = props.name as N;
    const currentValue = formState.getFieldValue(name);

    if ((props.disabled || props.readonly) && !isInitialization) {
      return;
    }

    if (props.isSelectable) {
      if (!isInitialization && Boolean(currentValue) === val) {
        return;
      }

      value = val as M[N];
    } else if (typeof props.parse === 'function') {
      value = props.parse(val as DisplayValue);

      if (!isInitialization && currentValue === value) {
        return;
      }
    } else {
      // There should always be a parser
      return;
    }

    const newErrors = validate(name, value, validationConstraints, formState);

    const errorsForDisplay = newErrors.length > 0 ? newErrors : [];
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
      setValue(event.currentTarget.checked);
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
      setField(event.currentTarget.checked);
    } else {
      setField(event.currentTarget.value);
    }
  };
}

export function createField(componentName: ComponentName, el: JSX.Element) {
  if (el && typeof el === 'object') {
    getComponentNameRegistry().set(el, componentName);
  }

  return el;
}

export function createFormField<
  G extends FormElementTag,
  M extends FieldValueMapping,
  N extends StringKeyOf<M>
>(initialProps: FormFieldProps<G, M, N>) {
  const [formState, formStateMutations] = useFormContext<M>();

  const props = mergeProps(formFieldDefaultProps, initialProps);
  const isSelectable = createMemo(
    () => props.isSelectable ?? (props.checked !== undefined || props.defaultChecked !== undefined)
  );
  const isInitialized = createMemo(() => formState.hasFieldBeenInitialized(props.name));
  const value = createMemo(() => formState.getFieldValue(props.name));
  const currentChecked = createMemo(() => (isSelectable() ? (props.checked ?? Boolean(value())) : undefined));
  const [validationConstraints] = splitProps(props, constraintNames);

  const setValue = createValueSetter<G, M, N, typeof validationConstraints>(
    formState,
    formStateMutations,
    validationConstraints,
    props
  );
  const onInput = createOnInput<G, M, N>(setValue, props);
  const onBlur = createOnBlur<G, M, N>(setValue, props, formStateMutations.setBlurredField);

  if (props.isControlled && !isInitialized()) {
    setValue(
      isSelectable() ? (props.checked ?? props.defaultChecked ?? props.defaultValue ?? false) : props.defaultValue,
      true
    );
  } else if (props.disabled && isInitialized()) {
    const disabledValue = (
      isSelectable() ? (props.checked ?? props.defaultChecked ?? props.defaultValue ?? false) : props.defaultValue
    ) as M[N];
    const errors = validate(props.name, disabledValue, validationConstraints, formState);
    formStateMutations.setFieldValue(
      props.name,
      disabledValue,
      errors.length > 0 ? errors : []
    );
  }

  const formattedValue = createMemo(() => props.format(value()));

  const newProps = mergeProps(props, {
    get id() {
      return props.name;
    },
    get value() {
      return formattedValue();
    },
    get disabled() {
      return Boolean(props.disabled || !props.name || formState.isLoading);
    },
    get errors() {
      return getDisplayableErrors(props.name, formState);
    },
    get checked() {
      return currentChecked();
    },
    get isInitialized() {
      return isInitialized();
    },
    setValue,
    onInput,
    onBlur
  });

  return createMemo(() => [newProps, createField] as const);
}
