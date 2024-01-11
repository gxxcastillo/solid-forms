import { type JSX } from 'solid-js';

export type CheckboxElementProps = JSX.InputHTMLAttributes<HTMLInputElement>;

export function Checkbox(props: CheckboxElementProps) {
  return <input type='checkbox' {...props} />;
}
