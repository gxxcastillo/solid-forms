import { describe, expect, it, vi } from 'vitest';

import { createOnBlur, createOnInput, createValueSetter } from './createFormField';

function makeState(value?: unknown) {
  return {
    fields: [],
    errors: [],
    isReady: true,
    isLoading: false,
    isProcessing: false,
    haveValuesChanged: true,
    isFormValid: true,
    isFieldValid: () => undefined,
    getField: () => undefined,
    getFieldValue: () => value,
    getFieldErrors: () => undefined,
    hasFieldBeenInitialized: () => false,
    hasFieldBeenValid: () => undefined,
    hasFieldChanged: () => undefined,
    hasFieldBlurred: () => undefined
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

function makeMutations() {
  return {
    initializeField: vi.fn(),
    setFieldValue: vi.fn(),
    setFieldErrors: vi.fn(),
    setChangedField: vi.fn(),
    setBlurredField: vi.fn(),
    setIsReady: vi.fn(),
    setIsLoading: vi.fn(),
    setIsProcessing: vi.fn()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

function makeInputEvent(checked: boolean, value = 'on') {
  return {
    currentTarget: { checked, value }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

describe('createOnInput', () => {
  it('passes booleans for selectable fields', () => {
    const setValue = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onInput = createOnInput(setValue, { name: 'accepted', isSelectable: true } as any);

    onInput(makeInputEvent(true));
    onInput(makeInputEvent(false));

    expect(setValue.mock.calls).toEqual([[true], [false]]);
  });
});

describe('createOnBlur', () => {
  it('marks the field blurred and passes a boolean for selectable fields', () => {
    const setValue = vi.fn();
    const setBlurredField = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onBlur = createOnBlur(setValue, { name: 'accepted', isSelectable: true } as any, setBlurredField);

    onBlur(makeInputEvent(true));

    expect(setBlurredField).toHaveBeenCalledWith('accepted');
    expect(setValue).toHaveBeenCalledWith(true);
  });
});

describe('createValueSetter', () => {
  it('stores selectable field values as booleans', () => {
    const state = makeState(false);
    const mutations = makeMutations();
    const setValue = createValueSetter(
      state,
      mutations,
      {},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { name: 'accepted', isSelectable: true } as any
    );

    setValue(true);

    expect(mutations.setFieldValue).toHaveBeenCalledWith('accepted', true, []);
  });

  it('initializes non-selectable fields even when the parsed value is unchanged', () => {
    const state = makeState(undefined);
    const mutations = makeMutations();
    const setValue = createValueSetter(
      state,
      mutations,
      {},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { name: 'username', parse: (value: unknown) => value } as any
    );

    setValue(undefined, true);

    expect(mutations.initializeField).toHaveBeenCalledWith('username', undefined, []);
  });

  it('reads the current value when invoked instead of using a mount-time snapshot', () => {
    let currentValue = false;
    const state = makeState();
    state.getFieldValue = () => currentValue;
    const mutations = makeMutations();
    const setValue = createValueSetter(
      state,
      mutations,
      {},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { name: 'accepted', isSelectable: true } as any
    );

    currentValue = true;
    setValue(true);

    expect(mutations.setFieldValue).not.toHaveBeenCalled();
  });
});
