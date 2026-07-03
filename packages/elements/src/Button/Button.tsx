import { type JSX } from 'solid-js';

import { stripInvalidProps } from '../utils';

export type ButtonElementProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button(initialProps: ButtonElementProps) {
  const props = stripInvalidProps(initialProps) as ButtonElementProps;
  return <button {...props} />;
}
