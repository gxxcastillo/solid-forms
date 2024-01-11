import { type JSX, splitProps } from 'solid-js';

import { Input } from '@gxxc/solid-forms-elements';
import { FieldValue, FormState, useFormContext } from '@gxxc/solid-forms-state';

import { useFormField, useFormFieldLabel } from '../hooks';
import { type FormFieldProps } from '../types';
import styles from './InputField.module.css';

export type ShowIconFn<V extends FieldValue> = (value: V | undefined, formState: FormState) => boolean;
export type ShowLabelFn<V extends FieldValue> = (value: V | undefined, formState: FormState) => boolean;

export type InputFieldProps<V extends FieldValue = FieldValue> = FormFieldProps<'input', V> & {
  leadingIcon?: JSX.Element;
  showLabel?: ShowLabelFn<V>;
  showIcon?: ShowIconFn<V>;
  icon?: JSX.Element;
  context?: JSX.Element;
};

export function InputField<V extends FieldValue>(initialProps: InputFieldProps<V>) {
  const [formState] = useFormContext();
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
  const withIcon = typeof showIcon === 'function' && showIcon(props.value, formState);
  const withLabel = typeof showLabel === 'function' && showLabel(props.value, formState);
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
