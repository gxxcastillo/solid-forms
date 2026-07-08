import { type JSX, createEffect, createMemo, mergeProps, onCleanup, splitProps } from 'solid-js';
import { type StringKeyOf } from 'type-fest';

import {
  type DisplayValue,
  type FieldName,
  type FieldValue,
  type FieldValueMapping,
  type FormState,
  type FormStateMutations,
  setComponentName,
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
  return hasFieldBeenValid(fieldName) || hasFieldBlurred(fieldName) ? getFieldErrors(fieldName) : undefined;
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
  formState: FormState<M>,
  formStateMutations: FormStateMutations<M>,
  validationConstraints: C,
  props: FormFieldProps<G, M, N>
) {
  const name = props.name as N;

  // Sequencing token: every commit bumps it, and an async custom validator only
  // applies its result while its captured token is still current. This stops a
  // slow validation of an older value from clobbering a newer value's errors.
  let validationToken = 0;

  function commit(value: M[N], isInitialization: boolean) {
    const token = ++validationToken;
    const newErrors = validate(name, value, validationConstraints, formState, props.label);
    const errorsForDisplay = newErrors.length > 0 ? newErrors : [];

    if (isInitialization) {
      formStateMutations.initializeField(name, value, errorsForDisplay, props.label);
    } else {
      formStateMutations.setFieldValue(name, value, errorsForDisplay);
    }

    // Custom validators run after built-in constraints and only when no built-in errors exist.
    // Sync validators call setFieldErrors immediately; async validators call it when they resolve.
    if (newErrors.length === 0 && props.validator) {
      props.validator(name, value, formState, (errors) => {
        if (token !== validationToken) return;
        formStateMutations.setFieldErrors(name, errors);
      });
    }
  }

  const setValue = Object.assign(
    function setValue(val?: FieldValue, isInitialization = false) {
      let value: M[N];
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

      commit(value, isInitialization);
    },
    {
      // Re-run validation against the field's current value without changing it.
      // Used to refresh a cross-field constraint (e.g. `match`) when the field it
      // depends on changes, since that change does not flow through this setValue.
      revalidate() {
        if (!formState.hasFieldBeenInitialized(name)) return;
        commit(formState.getFieldValue(name) as M[N], false);
      }
    }
  );

  return setValue;
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
    setComponentName(el, componentName);
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

  // Without this, a conditionally-rendered field leaves a stale entry in the
  // store that keeps counting toward isFormValid/haveValuesChanged/submitted
  // values after it unmounts (see strategic-backlog.md B1).
  onCleanup(() => formStateMutations.removeField(props.name));

  if (props.isControlled && !isInitialized()) {
    setValue(
      isSelectable() ? (props.checked ?? props.defaultChecked ?? props.defaultValue ?? false) : props.defaultValue,
      true
    );
  } else if (props.disabled && isInitialized()) {
    // Preserve the value the user already entered for a non-selectable field
    // when no explicit default is supplied — otherwise becoming disabled would
    // wipe the field's value (to undefined) out of the submitted payload.
    const currentValue = formState.getFieldValue(props.name);
    const disabledValue = (
      isSelectable()
        ? (props.checked ?? props.defaultChecked ?? props.defaultValue ?? false)
        : (props.defaultValue ?? currentValue)
    ) as M[N];
    const errors = validate(props.name, disabledValue, validationConstraints, formState);
    // Only overwrite errors when the disabled value actually violates a
    // constraint; passing `undefined` preserves any existing error (e.g. one set
    // by the server) rather than silently clearing it as `[]` would.
    formStateMutations.setFieldValue(props.name, disabledValue, errors.length > 0 ? errors : undefined);
  }

  // A `match` constraint depends on another field's value, which changes outside
  // this field's own input handler. Re-validate whenever that field changes so a
  // stale "does not match" verdict can't linger after the matched field is edited.
  if (props.match) {
    createEffect(() => {
      formState.getFieldValue(props.match as StringKeyOf<M>); // track the matched field
      setValue.revalidate();
    });
  }

  const formattedValue = createMemo(() => props.format(value()));
  const displayableErrors = createMemo(() => getDisplayableErrors(props.name, formState));
  const isDisabled = createMemo(() => Boolean(props.disabled || !props.name || formState.isLoading));

  const newProps = mergeProps(props, {
    get id() {
      return props.name;
    },
    get value() {
      return formattedValue();
    },
    get disabled() {
      return isDisabled();
    },
    get errors() {
      return displayableErrors();
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
