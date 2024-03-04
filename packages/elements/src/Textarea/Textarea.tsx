import { type JSX } from 'solid-js';

export type TextareaElementProps = JSX.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea(props: TextareaElementProps) {
  return <textarea {...props} />;
}
