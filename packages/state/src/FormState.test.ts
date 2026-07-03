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

  it('haveValuesChanged is false when no field has changed', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', '', []);
    expect(state.haveValuesChanged).toBe(false);
    dispose();
  });

  it('haveValuesChanged is true once a field value has changed', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', '', []);
    mutations.setFieldValue('username', 'alice');
    expect(state.haveValuesChanged).toBe(true);
    dispose();
  });

  it('isFormValid is true when no field has errors', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    expect(state.isFormValid).toBe(true);
    dispose();
  });

  it('isFormValid is false when any field has errors', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', '', ['Required']);
    expect(state.isFormValid).toBe(false);
    dispose();
  });

  it('getFieldValue returns the current value for a registered field', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    expect(state.getFieldValue('username')).toBe('alice');
    dispose();
  });

  it('getFieldValue returns undefined for a missing field', () => {
    const { store, dispose } = makeStore();
    const [state] = store;
    expect(state.getFieldValue('username')).toBeUndefined();
    dispose();
  });

  it('hasFieldBeenValid returns undefined for a missing field', () => {
    const { store, dispose } = makeStore();
    const [state] = store;
    expect(state.hasFieldBeenValid('username')).toBeUndefined();
    dispose();
  });

  it('hasFieldBeenValid reflects the field having been error-free', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    expect(state.hasFieldBeenValid('username')).toBe(true);
    dispose();
  });

  it('getFieldErrors returns undefined for a missing field', () => {
    const { store, dispose } = makeStore();
    const [state] = store;
    expect(state.getFieldErrors('username')).toBeUndefined();
    dispose();
  });

  it('getFieldErrors returns the errors for a registered field', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', '', ['Required']);
    expect(state.getFieldErrors('username')).toEqual(['Required']);
    dispose();
  });

  it('hasFieldChanged returns undefined for a missing field', () => {
    const { store, dispose } = makeStore();
    const [state] = store;
    expect(state.hasFieldChanged('username')).toBeUndefined();
    dispose();
  });

  it('hasFieldChanged reflects whether the field value has changed', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', '', []);
    expect(state.hasFieldChanged('username')).toBe(false);
    mutations.setFieldValue('username', 'alice');
    expect(state.hasFieldChanged('username')).toBe(true);
    dispose();
  });

  it('hasFieldBlurred returns undefined for a missing field', () => {
    const { store, dispose } = makeStore();
    const [state] = store;
    expect(state.hasFieldBlurred('username')).toBeUndefined();
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

describe('setChangedField', () => {
  it('marks a field as changed', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', '', []);
    expect(state.getField('username')?.hasChanged).toBe(false);
    mutations.setChangedField('username');
    expect(state.getField('username')?.hasChanged).toBe(true);
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

describe('setErrors', () => {
  it('sets form-level errors', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.setErrors(['Server error']);
    expect(state.errors).toEqual(['Server error']);
    dispose();
  });

  it('defaults to an empty array when called without arguments', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.setErrors(['Server error']);
    mutations.setErrors();
    expect(state.errors).toEqual([]);
    dispose();
  });
});
