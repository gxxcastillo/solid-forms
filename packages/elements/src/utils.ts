import { splitProps } from 'solid-js';

export function stripInvalidProps(props: any) {
  return splitProps(props, ['isControlled', 'isInitialized', 'parse', 'setValue', 'errors', 'format'])[1];
}
