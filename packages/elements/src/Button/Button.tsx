import { type JSX } from 'solid-js';

export type ButtonElementProps = JSX.InputHTMLAttributes<HTMLInputElement>;

export function Button(props: ButtonElementProps) {
  return <input {...props} />;
}
