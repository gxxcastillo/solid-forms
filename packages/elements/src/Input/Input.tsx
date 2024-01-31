import { Accessor, type JSX, createEffect, createRenderEffect, splitProps } from 'solid-js';

declare module 'solid-js' {
  namespace JSX {
    interface DirectiveFunctions {
      field: typeof field;
    }
  }
}

export type InputProps = JSX.InputHTMLAttributes<HTMLInputElement>;
type DirectiveProps = Pick<InputProps, 'value' | 'onInput' | 'onBlur'>;

function field(element: HTMLInputElement, props: Accessor<DirectiveProps>) {
  createRenderEffect(() => {
    element.value = (props().value ?? '')?.toString();
  });

  createEffect(() => {
    const onInput = props().onInput;
    if (onInput) {
      element.addEventListener<'beforeinput'>(
        'beforeinput',
        onInput as (this: HTMLInputElement, ev: InputEvent) => unknown
      );
    }
  });

  createEffect(() => {
    const onBlur = props().onBlur;
    if (onBlur) {
      element.addEventListener<'blur'>('blur', onBlur as (this: HTMLInputElement, ev: FocusEvent) => unknown);
    }
  });
}

export function Input(initialProps: InputProps) {
  const [directiveProps, props] = splitProps(initialProps, ['value', 'onInput', 'onBlur']);
  return <input use:field={directiveProps} {...props} />;
}
