import { JSX } from 'solid-js';

import { useFormField } from '../hooks/useFormField';

// @TODO - FieldSetProps<P, V> might end up causing a problem IF the "component" passed into this FormField does not take FieldSetProps<P, V> as props
// in which case, I'd have to figure out some way of finding out what properties the "component" takes, and use those instead
// for now, I hope this works...
export type FormFieldProps<P, V> = any & {
  component: JSX.Element;
};

export function FormField<P extends object, V>(props: FormFieldProps<P, V>) {
  const FieldComponent = props.component;
  const fieldSetProps = useFormField(props);

  return <FieldComponent {...fieldSetProps} />;
}

export default FormField;
