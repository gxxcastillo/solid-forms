import { splitProps } from 'solid-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function stripInvalidProps(props: Record<any, any>) {
  return splitProps(props, [
    'isControlled',
    'isInitialized',
    'isValid',
    'isDisabled',
    'isSelectable',
    'parse',
    'setValue',
    'errors',
    'format',
    'validator',
    'match',
    'showIcon',
    'defaultValue',
    'defaultChecked'
  ])[1];
}
