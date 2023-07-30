import { JSX } from 'solid-js';

export type ButtonElementProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button(props: ButtonElementProps) {
  return <button {...props} />;
}

export default Button;
