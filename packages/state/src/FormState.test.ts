import { createRoot } from 'solid-js';
import { describe, expect, it } from 'vitest';

import { createFormStore } from './FormState';

type TestFields = { username: string; password: string };

function makeStore(state?: Parameters<typeof createFormStore<TestFields>>[0]) {
  return createRoot((dispose) => {
    const store = createFormStore<TestFields>(state);
    return { store, dispose };
  });
}

describe('createFormStore', () => {
  it('initializes with empty fields and no errors', () => {
    const { store, dispose } = makeStore();
    const [state] = store;
    expect(state.fields).toEqual([]);
    expect(state.errors).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.isProcessing).toBe(false);
    dispose();
  });

  it('isFieldValid returns undefined for a missing field', () => {
    const { store, dispose } = makeStore();
    const [state] = store;
    expect(state.isFieldValid('username')).toBeUndefined();
    dispose();
  });

  it('isFieldValid returns true for a field with no errors', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    expect(state.isFieldValid('username')).toBe(true);
    dispose();
  });

  it('isFieldValid returns false for a field with errors', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', '', ['Required']);
    expect(state.isFieldValid('username')).toBe(false);
    dispose();
  });
});

describe('initializeField', () => {
  it('preserves initial errors', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', '', ['Required']);
    const field = state.getField('username');
    expect(field?.errors).toEqual(['Required']);
    dispose();
  });

  it('marks a field with a defined value and no errors as valid', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    const field = state.getField('username');
    expect(field?.hasBeenValid).toBe(true);
    dispose();
  });

  it('does not mark a field with errors as valid', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', '', ['Required']);
    const field = state.getField('username');
    expect(field?.hasBeenValid).toBe(false);
    dispose();
  });

  it('does not reinitialize an already-initialized field', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    mutations.initializeField('username', 'bob', ['Taken']);
    const field = state.getField('username');
    expect(field?.value).toBe('alice');
    expect(field?.errors).toEqual([]);
    dispose();
  });
});

describe('setFieldValue', () => {
  it('creates the field when called for the first time', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.setFieldValue('username', 'alice');
    expect(state.getField('username')).toBeDefined();
    expect(state.getField('username')?.value).toBe('alice');
    dispose();
  });

  it('preserves supplied errors when creating a new field', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.setFieldValue('username', '', ['Required']);
    expect(state.getField('username')?.errors).toEqual(['Required']);
    dispose();
  });

  it('updates errors even when the value is unchanged', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    mutations.setFieldValue('username', 'alice', ['Already taken']);
    expect(state.getField('username')?.errors).toEqual(['Already taken']);
    dispose();
  });

  it('marks a field as changed after an actual value update', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', '', []);
    mutations.setFieldValue('username', 'alice');
    expect(state.getField('username')?.hasChanged).toBe(true);
    dispose();
  });

  it('does not mark a field as changed when only errors change', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    mutations.setFieldValue('username', 'alice', ['Already taken']);
    expect(state.getField('username')?.hasChanged).toBe(false);
    dispose();
  });

  it('tracks hasBeenValid correctly across updates', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    expect(state.getField('username')?.hasBeenValid).toBe(true);
    // introducing errors should not erase hasBeenValid
    mutations.setFieldValue('username', 'bob', ['Already taken']);
    expect(state.getField('username')?.hasBeenValid).toBe(true);
    dispose();
  });

  it('sets hasBeenValid true when errors are cleared', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', '', ['Required']);
    expect(state.getField('username')?.hasBeenValid).toBe(false);
    mutations.setFieldValue('username', 'alice', []);
    expect(state.getField('username')?.hasBeenValid).toBe(true);
    dispose();
  });

  it('preserves existing errors when called without an errors argument', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', ['Server error']);
    mutations.setFieldValue('username', 'alice');
    expect(state.getField('username')?.errors).toEqual(['Server error']);
    dispose();
  });

  it('skips the reactive update when value and errors are both unchanged', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', ['Required']);
    const fieldBefore = state.getField('username');
    mutations.setFieldValue('username', 'alice', ['Required']);
    expect(state.getField('username')).toBe(fieldBefore);
    dispose();
  });

  it('does not flip hasBeenValid when errors are preserved from initialization', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', undefined, ['Required']);
    expect(state.getField('username')?.hasBeenValid).toBe(false);
    mutations.setFieldValue('username', undefined);
    expect(state.getField('username')?.hasBeenValid).toBe(false);
    dispose();
  });
});

describe('setFieldErrors', () => {
  it('updates field-level errors', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    mutations.setFieldErrors('username', ['Server error']);
    expect(state.getField('username')?.errors).toEqual(['Server error']);
    dispose();
  });

  it('clears errors when called with an empty array', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', '', ['Required']);
    mutations.setFieldErrors('username', []);
    expect(state.getField('username')?.errors).toEqual([]);
    dispose();
  });
});

describe('setBlurredField', () => {
  it('marks a field as blurred', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', '', []);
    expect(state.getField('username')?.hasBeenBlurred).toBe(false);
    mutations.setBlurredField('username');
    expect(state.getField('username')?.hasBeenBlurred).toBe(true);
    dispose();
  });
});
