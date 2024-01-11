import { type JSX } from 'solid-js';

export type SelectElementProps = JSX.SelectHTMLAttributes<HTMLSelectElement>;

export function Select(props: SelectElementProps) {
  return <select {...props} />;
}
