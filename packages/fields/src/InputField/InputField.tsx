import { type JSX, splitProps } from 'solid-js';
import { type StringKeyOf } from 'type-fest';

import { Input } from '@gxxc/solid-forms-elements';
import { FieldValueMapping, FormState, useFormContext } from '@gxxc/solid-forms-state';

import { useFormField, useFormFieldLabel } from '../hooks';
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
  const [{ showLabel, leadingIcon, showIcon, icon, context }, parsedProps] = splitProps(initialProps, [
    'showLabel',
    'leadingIcon',
    'showIcon',
    'icon',
    'context'
  ]);

  const [createField, props] = useFormField(parsedProps);
  const { label, placeholder } = useFormFieldLabel({
    value: props.value,
    label: props.label
  });

  const hasValue = !!props.value;
  const withIcon = typeof showIcon === 'function' && showIcon(props.value as M[N], formState as FormState<M>);
  const withLabel =
    typeof showLabel === 'function' && showLabel(props.value as M[N], formState as FormState<M>);
  const classList = {
    [styles.InputFieldSet]: true,
    [styles.hasValue]: hasValue,
    [styles.withLeadingIcon]: !!leadingIcon,
    [styles.withIcon]: withIcon,
    [styles.withLabel]: withLabel
  };

  return createField(
    'Field',
    <div classList={classList}>
      {props.title && <div class={styles.title}>{props.title}</div>}
      <div class={styles.inputContainer}>
        <div class={styles.leadingIcon}>{leadingIcon}</div>
        <Input {...props} class={styles.input} id={props.id} placeholder={placeholder} value={props.value} />
        {withIcon && <div class={styles.icon}>{icon}</div>}
        {context && <div class={styles.context}>{context}</div>}
        {withLabel && (
          <label for={props.id} class={styles.label}>
            {label}
          </label>
        )}
      </div>
    </div>
  );
}
