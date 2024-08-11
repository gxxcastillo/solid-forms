import { splitProps } from 'solid-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function stripInvalidProps(props: Record<any, any>) {
  return splitProps(props, ['isControlled', 'isInitialized', 'parse', 'setValue', 'errors', 'format'])[1];
}
