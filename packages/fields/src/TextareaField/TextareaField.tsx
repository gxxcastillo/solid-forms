import { type JSX, createSignal, splitProps } from 'solid-js';

import { Textarea } from '@gxxc/solid-forms-elements';

import { useFormField, useFormFieldLabel } from '../hooks';
import styles from './TextareaField.module.css';

type OnInputHandler = JSX.EventHandler<HTMLTextAreaElement, InputEvent>;
type OnInputEvent = Parameters<OnInputHandler>[0];

export function TextAreaField(initialProps: any) {
  function onInput(event?: OnInputEvent) {
    const textareaEl = event?.target;
    const currentHeight = textareaEl?.clientHeight;
    if (heightOffset === undefined) {
      setHeightOffset(120 - (currentHeight || 0));
    } else if (textareaEl) {
      const hasOverflow = textareaEl.scrollHeight > textareaEl.clientHeight;

      if (hasOverflow) {
        setHeight(textareaEl.scrollHeight + props.heightOffset);
      }
    }

    if (event) {
      props.onInput?.(event);
    }
  }

  // @TODO - Re-implement Markdown support
  function onChangeHandlerMarkdown(value?: string, event?: OnInputEvent) {
    onInput(event);
  }

  const TEXTAREA_MIN_HEIGHT = 160;
  const [heightOffset, setHeightOffset] = createSignal<number>();
  const [height, setHeight] = createSignal(TEXTAREA_MIN_HEIGHT);
  const [createField, props] = useFormField<HTMLTextAreaElement>(initialProps);

  const { placeholder } = useFormFieldLabel({
    value: props.value,
    label: props.label
  });

  return createField(
    'Field',
    <div class={styles.TextArea}>
      {props.title && <div class={styles.title}>{props.title}</div>}
      <div class={styles.textAreaContainer}>
        <div class={styles.textArea}>
          <Textarea
            placeholder={placeholder}
            value={props.value}
            style={{ height: props.height }}
            class={styles.textAreaEl}
            onInput={onInput}
          />
        </div>
      </div>
    </div>
  );
}
