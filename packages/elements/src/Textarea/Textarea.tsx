import { Accessor, type JSX, createEffect, createRenderEffect, splitProps } from 'solid-js';

declare module 'solid-js' {
  namespace JSX {
    interface DirectiveFunctions {
      textareaField: typeof textareaField;
    }
  }
}

export type TextareaElementProps = JSX.TextareaHTMLAttributes<HTMLTextAreaElement>;
export type DirectiveProps = Pick<TextareaElementProps, 'value' | 'onInput' | 'onBlur'>;

function textareaField(element: HTMLTextAreaElement, props: Accessor<DirectiveProps>) {
  createRenderEffect(() => {
    element.value = (props().value ?? '')?.toString();
  });

  createEffect(() => {
    const onInput = props().onInput;
    if (onInput) {
      element.addEventListener<'beforeinput'>(
        'beforeinput',
        onInput as (this: HTMLTextAreaElement, ev: InputEvent) => unknown
      );
    }
  });

  createEffect(() => {
    const onBlur = props().onBlur;
    if (onBlur) {
      element.addEventListener<'blur'>('blur', onBlur as (this: HTMLTextAreaElement, ev: FocusEvent) => unknown);
    }
  });
}

export function Textarea(initialProps: TextareaElementProps) {
  const [directiveProps, props] = splitProps(initialProps, ['value', 'onInput', 'onBlur']);
  return <textarea use:textareaField={directiveProps} {...props} />;
}
