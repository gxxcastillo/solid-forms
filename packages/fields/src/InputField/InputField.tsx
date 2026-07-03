import { type JSX, createMemo, createUniqueId, splitProps } from 'solid-js';
import { type StringKeyOf } from 'type-fest';

import { Input } from '@gxxc/solid-forms-elements';
import { type FieldValueMapping, type FormState, useFormContext } from '@gxxc/solid-forms-state';

import { createFormField, useFormFieldLabel } from '../hooks';
import { type FormFieldProps } from '../types';
import styles from './InputField.module.css';

export type ShowIconFn<M extends FieldValueMapping, N extends StringKeyOf<M>> = (
  value: M[N] | undefined,
  formState?: FormState<M>
) => boolean;

export type ShowLabelFn<M extends FieldValueMapping, N extends StringKeyOf<M>> = (
  value: M[N] | undefined,
  formState?: FormState<M>
) => boolean;

export type InputFieldProps<M extends FieldValueMapping, N extends StringKeyOf<M>> = FormFieldProps<
  'input',
  M,
  N
> & {
  leadingIcon?: JSX.Element;
  showLabel?: ShowLabelFn<M, N>;
  showIcon?: ShowIconFn<M, N>;
  icon?: JSX.Element;
  context?: JSX.Element;
};

export function InputField<M extends FieldValueMapping, N extends StringKeyOf<M>>(
  initialProps: InputFieldProps<M, N>
) {
  const [formState] = useFormContext<M>();
  const [localProps, parsedProps] = splitProps(initialProps, [
    'showLabel',
    'leadingIcon',
    'showIcon',
    'icon',
    'context'
  ]);

  const [props, createField] = createFormField<'input', M, N>(parsedProps)();
  const value = createMemo(() => formState.getFieldValue(props.name));
  const leadingIcon = createMemo(() => localProps.leadingIcon);
  const withLabel = createMemo(
    () =>
      typeof localProps.showLabel === 'function' && localProps.showLabel(value()!, formState as FormState<M>)
  );
  const withIcon = createMemo(
    () =>
      typeof localProps.showIcon === 'function' && localProps.showIcon(value()!, formState as FormState<M>)
  );
  const icon = createMemo(() => localProps.icon);
  const context = createMemo(() => localProps.context);
  const initialLabel = createMemo(() => props.label);
  const hasValue = createMemo(() => !!value());
  const errorId = createUniqueId();
  const label = createMemo(() =>
    useFormFieldLabel({
      value: value(),
      label: initialLabel()
    })
  );

  const classList = {
    [styles.InputFieldSet]: true,
    [styles.hasValue]: hasValue(),
    [styles.withLeadingIcon]: !!leadingIcon(),
    [styles.withIcon]: withIcon(),
    [styles.withLabel]: withLabel()
  };

  return createField(
    'InputField',
    <div classList={classList}>
      {props.title && <div class={styles.title}>{props.title}</div>}
      <div class={styles.inputContainer}>
        <div class={styles.leadingIcon}>{leadingIcon()}</div>
        <Input
          {...props}
          class={styles.input}
          id={props.id}
          placeholder={label().placeholder}
          aria-invalid={!!props.errors?.length}
          aria-describedby={props.errors?.length ? errorId : undefined}
        />
        {withIcon() && <div class={styles.icon}>{icon()}</div>}
        {context && <div class={styles.context}>{context()}</div>}
        {withLabel() && (
          <label for={props.id} class={styles.label}>
            {label().label}
          </label>
        )}
      </div>
      {props.errors?.[0] && (
        <div id={errorId} class={styles.error} role='alert'>
          {props.errors[0]}
        </div>
      )}
    </div>
  );
}
