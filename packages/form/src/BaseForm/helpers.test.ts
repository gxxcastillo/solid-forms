import { describe, expect, it, vi } from 'vitest';

import { createBaseFormOnSubmitHandler, fieldsToProps, resolveSubmitHandler } from './helpers';

function makeEvent(name = '') {
  return {
    preventDefault: vi.fn(),
    submitter: { name }
  } as unknown as Event & { submitter: HTMLElement };
}

function makeState(overrides: Record<string, unknown> = {}) {
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
    getFieldValue: () => undefined,
    getFieldErrors: () => undefined,
    hasFieldBeenInitialized: () => false,
    hasFieldBeenValid: () => undefined,
    hasFieldChanged: () => undefined,
    hasFieldBlurred: () => undefined,
    ...overrides
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

describe('fieldsToProps', () => {
  it('converts fields array to a name→value map', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fields: any[] = [
      { name: 'email', value: 'a@b.com' },
      { name: 'age', value: 30 }
    ];
    expect(fieldsToProps(fields)).toEqual({ email: 'a@b.com', age: 30 });
  });
});

describe('createBaseFormOnSubmitHandler', () => {
  it('calls onSubmit with serialized field values', async () => {
    const onSubmit = vi.fn();
    const state = makeState({
      fields: [{ name: 'email', value: 'test@example.com', errors: [], hasBeenInitialized: true, hasBeenBlurred: false, hasChanged: true, hasBeenValid: false }]
    });
    const mutations = makeMutations();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = createBaseFormOnSubmitHandler({ onSubmit } as any, state, mutations);

    await handler(makeEvent());

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith({ email: 'test@example.com' }, '');
  });

  it('does not call onSubmit while already processing', async () => {
    const onSubmit = vi.fn();
    const state = makeState({ isProcessing: true });
    const mutations = makeMutations();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = createBaseFormOnSubmitHandler({ onSubmit } as any, state, mutations);

    await handler(makeEvent());

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits even when no field values have changed', async () => {
    // A pristine, pre-filled, or submit-to-validate form must still submit;
    // submission is only blocked while already processing.
    const onSubmit = vi.fn();
    const state = makeState({ haveValuesChanged: false });
    const mutations = makeMutations();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = createBaseFormOnSubmitHandler({ onSubmit } as any, state, mutations);

    await handler(makeEvent());

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('sets and resets isProcessing around a successful async submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const state = makeState();
    const mutations = makeMutations();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = createBaseFormOnSubmitHandler({ onSubmit } as any, state, mutations);

    await handler(makeEvent());

    expect(mutations.setIsProcessing.mock.calls).toEqual([[true], [false]]);
  });

  it('propagates a failed async submit while still resetting isProcessing', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('submit failed'));
    const state = makeState();
    const mutations = makeMutations();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = createBaseFormOnSubmitHandler({ onSubmit } as any, state, mutations);

    // The failure is propagated to the caller (BaseForm surfaces it) rather than
    // being silently swallowed, but isProcessing is always cleared via finally.
    await expect(handler(makeEvent())).rejects.toThrow('submit failed');

    expect(mutations.setIsProcessing.mock.calls).toEqual([[true], [false]]);
  });

  it('sets and resets isProcessing for a sync submit handler', async () => {
    const onSubmit = vi.fn().mockReturnValue(undefined);
    const state = makeState();
    const mutations = makeMutations();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = createBaseFormOnSubmitHandler({ onSubmit } as any, state, mutations);

    await handler(makeEvent());

    expect(mutations.setIsProcessing.mock.calls).toEqual([[true], [false]]);
  });

  it('invokes the sole object handler when submitted without a named button (Enter key)', async () => {
    const login = vi.fn();
    const state = makeState();
    const mutations = makeMutations();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = createBaseFormOnSubmitHandler({ onSubmit: { login } } as any, state, mutations);

    await handler(makeEvent('')); // empty submitter name == no named button

    expect(login).toHaveBeenCalledOnce();
  });
});

describe('resolveSubmitHandler', () => {
  it('returns a function-style handler directly', () => {
    const fn = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(resolveSubmitHandler(fn as any, 'anything')).toBe(fn);
  });

  it('selects an object handler by submitter name', () => {
    const saveDraft = vi.fn();
    const publish = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(resolveSubmitHandler({ saveDraft, publish } as any, 'publish')).toBe(publish);
  });

  it('falls back to the sole handler when there is no submitter name', () => {
    const login = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(resolveSubmitHandler({ login } as any, undefined)).toBe(login);
  });

  it('returns undefined for an ambiguous map with no submitter name', () => {
    const saveDraft = vi.fn();
    const publish = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(resolveSubmitHandler({ saveDraft, publish } as any, undefined)).toBeUndefined();
  });
});
