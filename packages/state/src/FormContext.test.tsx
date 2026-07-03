import { createRoot } from 'solid-js';
import { describe, expect, it } from 'vitest';

import { FormContextProvider, useFormContext } from './FormContext';
import { createFormStore } from './FormState';
import { type FormStore } from './types';

type TestFields = { email: string };

function Capture(props: { onCapture: (store: FormStore<TestFields>) => void }) {
  props.onCapture(useFormContext<TestFields>());
  return null;
}

describe('useFormContext', () => {
  it('returns an empty array when there is no provider', () => {
    expect(useFormContext()).toEqual([]);
  });
});

describe('FormContextProvider', () => {
  it('provides the given store to descendants', () => {
    createRoot((dispose) => {
      const store = createFormStore<TestFields>();
      let captured: FormStore<TestFields> | undefined;

      (() => (
        <FormContextProvider store={store}>
          <Capture onCapture={(s) => (captured = s)} />
        </FormContextProvider>
      ))();

      expect(captured).toBe(store);
      dispose();
    });
  });

  it('creates its own store when none is provided', () => {
    createRoot((dispose) => {
      let captured: FormStore<TestFields> | undefined;

      (() => (
        <FormContextProvider>
          <Capture onCapture={(s) => (captured = s)} />
        </FormContextProvider>
      ))();

      expect(captured).toBeDefined();
      expect(captured?.[0].fields).toEqual([]);
      dispose();
    });
  });
});
