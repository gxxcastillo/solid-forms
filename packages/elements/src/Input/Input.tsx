import { JSX } from 'solid-js';

export type InputElementProps = JSX.InputHTMLAttributes<HTMLInputElement>;

export function Input(props: InputElementProps) {
  return <input {...props} />;
}

export default Input;
