import { For, Show, type JSX } from 'solid-js';

import type { FieldValueMapping, FormState } from '@gxxc/solid-forms';

import styles from './FormStateInspector.module.css';

interface FormStateInspectorProps<M extends FieldValueMapping> {
  title?: string;
  state: FormState<M>;
}

function formatValue(value: unknown): string {
  if (value === undefined) return '-';
  if (value === '') return '""';
  return JSON.stringify(value);
}

export function FormStateInspector<M extends FieldValueMapping>(
  props: FormStateInspectorProps<M>
): JSX.Element {
  return (
    <div class={styles.panel}>
      <h3 class={styles.heading}>{props.title ?? 'Form state'}</h3>

      <div class={styles.summary}>
        <span class={props.state.isFormValid ? styles.badgeGood : styles.badgeBad}>
          {props.state.isFormValid ? 'Valid' : 'Invalid'}
        </span>
        <span class={styles.badge}>{props.state.haveValuesChanged ? 'Changed' : 'Unchanged'}</span>
        <Show when={props.state.isProcessing}>
          <span class={styles.badge}>Processing...</span>
        </Show>
      </div>

      <dl class={styles.fields}>
        <For each={props.state.fields} fallback={<p class={styles.empty}>No fields registered yet.</p>}>
          {(field) => (
            <div class={styles.field}>
              <dt class={styles.fieldName}>{field.label ?? field.name}</dt>
              <dd class={styles.fieldValue}>{formatValue(field.value)}</dd>
              <div class={styles.fieldMeta}>
                <span class={field.hasChanged ? styles.tagOn : styles.tagOff}>changed</span>
                <span class={field.hasBeenBlurred ? styles.tagOn : styles.tagOff}>blurred</span>
                <span class={field.errors.length ? styles.tagOff : styles.tagOn}>valid</span>
              </div>
              <Show when={(field.hasBeenValid || field.hasBeenBlurred) && field.errors.length}>
                <ul class={styles.errors}>
                  <For each={field.errors}>{(err) => <li>{err}</li>}</For>
                </ul>
              </Show>
            </div>
          )}
        </For>
      </dl>
    </div>
  );
}

export default FormStateInspector;
