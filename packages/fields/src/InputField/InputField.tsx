import { JSX, splitProps } from 'solid-js';

import { Input, InputProps } from '@gxxc/solid-forms-elements';

import { useFormField, useFormFieldLabel } from '../hooks';
import { FieldBuilderProps } from '../types';
import styles from './InputField.module.css';

export type InputFieldBuilderProps = FieldBuilderProps<InputProps, string> & {
  withLabel?: boolean;
  leadingIcon?: JSX.Element;
  icon?: JSX.Element;
  context?: JSX.Element;
};

// export type InputFieldProps = FormFieldComponentProps<InputFieldBuilderProps, string>;
const localPropNames = [
  'type',
  'title',
  'value',
  'id',

  // custom props
  'label',
  'error',
  'errors',
  'withLabel',
  'leadingIcon',
  'icon',
  'context',
  'isInitialized',
  'isLoading',
  'showIcon',
  'setValue'
];

export function InputField(initialProps: InputFieldBuilderProps) {
  const allProps = useFormField(initialProps);
  const [props, restProps] = splitProps(allProps, localPropNames);
  const { label, placeholder } = useFormFieldLabel({
    value: props.value,
    label: props.label
  });
  const hasValue = !!props.value;

  if (!props.showIcon) {
    props.showIcon = () => !!props.icon;
  }

  const classList = {
    [styles.InputFieldSet]: true,
    [styles.hasValue]: hasValue,
    [styles.withLeadingIcon]: !!props.leadingIcon,
    [styles.withLabel]: props.withLabel
  };

  return (
    <div classList={classList}>
      {props.title && <div class={styles.title}>{props.title}</div>}
      <div class={styles.inputContainer}>
        <div class={styles.leadingIcon}>{props.leadingIcon}</div>
        <Input
          type={props.type}
          class={styles.input}
          id={props.id}
          placeholder={placeholder}
          value={`${props.value || ''}`}
          {...restProps}
        />
        {props.showIcon(props.value as string, props.errors) && (
          <div class={styles.icon}>{props.icon}</div>
        )}
        {props.context && <div class={styles.context}>{props.context}</div>}
        {props.withLabel && (
          <label for={props.id} class={styles.label}>
            {label}
          </label>
        )}
      </div>
    </div>
  );
}

export default InputField;
