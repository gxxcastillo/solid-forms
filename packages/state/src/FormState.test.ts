import { createRoot } from 'solid-js';
import { describe, expect, it } from 'vitest';

import { createFormStore } from './FormState';

type TestFields = { username: string; password: string };
type DottedTestFields = { 'user.email': string };

function makeStore(state?: Parameters<typeof createFormStore<TestFields>>[0]) {
  return createRoot((dispose) => {
    const store = createFormStore<TestFields>(state);
    return { store, dispose };
  });
}

function makeDottedStore(state?: Parameters<typeof createFormStore<DottedTestFields>>[0]) {
  return createRoot((dispose) => {
    const store = createFormStore<DottedTestFields>(state);
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

describe('removeField', () => {
  it('removes a registered field', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    expect(state.getField('username')).toBeDefined();
    mutations.removeField('username');
    expect(state.getField('username')).toBeUndefined();
    dispose();
  });

  it('stops a removed field from counting toward isFormValid', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', '', ['Required']);
    expect(state.isFormValid).toBe(false);
    mutations.removeField('username');
    expect(state.isFormValid).toBe(true);
    dispose();
  });

  it('stops a removed field from counting toward haveValuesChanged', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', '', []);
    mutations.setFieldValue('username', 'alice');
    expect(state.haveValuesChanged).toBe(true);
    mutations.removeField('username');
    expect(state.haveValuesChanged).toBe(false);
    dispose();
  });

  it('is a no-op for a field that was never registered', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    expect(() => mutations.removeField('username')).not.toThrow();
    expect(state.fields).toEqual([]);
    dispose();
  });

  it('leaves other fields untouched', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    mutations.initializeField('password', 'secret', []);
    mutations.removeField('username');
    expect(state.getField('username')).toBeUndefined();
    expect(state.getField('password')?.value).toBe('secret');
    dispose();
  });
});

describe('resetField', () => {
  it('reverts the value to what it was at initialization', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    mutations.setFieldValue('username', 'bob');
    mutations.resetField('username');
    expect(state.getFieldValue('username')).toBe('alice');
    dispose();
  });

  it('clears errors', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    mutations.setFieldValue('username', '', ['Required']);
    mutations.resetField('username');
    expect(state.getFieldErrors('username')).toEqual([]);
    dispose();
  });

  it('clears hasChanged and hasBeenBlurred', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    mutations.setFieldValue('username', 'bob');
    mutations.setBlurredField('username');
    mutations.resetField('username');
    expect(state.hasFieldChanged('username')).toBe(false);
    expect(state.hasFieldBlurred('username')).toBe(false);
    dispose();
  });

  it('recomputes hasBeenValid from the initial value', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', undefined, []);
    mutations.setFieldValue('username', 'alice');
    expect(state.hasFieldBeenValid('username')).toBe(true);
    mutations.resetField('username');
    // Initial value was undefined, so a fresh field with no value is not valid.
    expect(state.hasFieldBeenValid('username')).toBe(false);
    dispose();
  });

  it('re-promotes hasBeenValid once a same-value revalidation confirms the reverted value is valid', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    mutations.setFieldValue('username', 'bob');
    mutations.resetField('username');
    expect(state.hasFieldBeenValid('username')).toBe(false);

    // Mirrors createFormField's post-reset revalidate(): same value, same
    // (empty) errors as the reset already set — a true no-op by value/errors
    // alone, so this must not be skipped in a way that leaves hasBeenValid
    // stuck at the reset's pessimistic `false`.
    mutations.setFieldValue('username', 'alice', []);
    expect(state.hasFieldBeenValid('username')).toBe(true);
    dispose();
  });

  it('bumps the field generation', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    const before = state.getField('username')?.generation;
    mutations.resetField('username');
    expect(state.getField('username')?.generation).toBe((before ?? 0) + 1);
    dispose();
  });

  it('marks wasReset true, alongside the generation bump', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    expect(state.getField('username')?.wasReset).toBe(false);
    mutations.resetField('username');
    expect(state.getField('username')?.wasReset).toBe(true);
    dispose();
  });

  it('is a no-op for a field that was never registered', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    expect(() => mutations.resetField('username')).not.toThrow();
    expect(state.fields).toEqual([]);
    dispose();
  });

  it('leaves other fields untouched', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    mutations.initializeField('password', 'secret', []);
    mutations.setFieldValue('password', 'changed');
    mutations.resetField('username');
    expect(state.getFieldValue('password')).toBe('changed');
    dispose();
  });
});

describe('setValues', () => {
  it('sets current values for already-registered fields', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    mutations.initializeField('password', 'secret', []);
    mutations.setValues({ username: 'bob', password: 'new-secret' });
    expect(state.getFieldValue('username')).toBe('bob');
    expect(state.getFieldValue('password')).toBe('new-secret');
    dispose();
  });

  it('ignores keys for fields that are not registered', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    expect(() => mutations.setValues({ username: 'bob', password: 'secret' })).not.toThrow();
    expect(state.getField('password')).toBeUndefined();
    dispose();
  });

  it('marks touched fields as changed', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    mutations.setValues({ username: 'bob' });
    expect(state.hasFieldChanged('username')).toBe(true);
    dispose();
  });

  it('preserves existing errors', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    mutations.setFieldValue('username', '', ['Required']);
    mutations.setValues({ username: 'bob' });
    expect(state.getFieldErrors('username')).toEqual(['Required']);
    dispose();
  });

  it('marks a field valid when setting its value while it has no errors', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', undefined, []);
    expect(state.hasFieldBeenValid('username')).toBe(false);
    mutations.setValues({ username: 'alice' });
    expect(state.hasFieldBeenValid('username')).toBe(true);
    dispose();
  });

  it('does not mark a field valid while it still has errors', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', '', ['Required']);
    mutations.setValues({ username: 'alice' });
    expect(state.hasFieldBeenValid('username')).toBe(false);
    dispose();
  });

  it('does not rebaseline the initial value used by a later reset', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    mutations.setValues({ username: 'bob' });
    mutations.resetField('username');
    expect(state.getFieldValue('username')).toBe('alice');
    dispose();
  });

  it('is a no-op when the value is unchanged', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    mutations.setValues({ username: 'alice' });
    // A real (non-skipped) set would unconditionally mark the field changed
    // and bump its generation, even for an equal value.
    expect(state.hasFieldChanged('username')).toBe(false);
    expect(state.getField('username')?.generation).toBe(0);
    dispose();
  });

  it('marks wasReset false, unlike resetField/reset', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    mutations.resetField('username');
    expect(state.getField('username')?.wasReset).toBe(true);
    mutations.setValues({ username: 'bob' });
    expect(state.getField('username')?.wasReset).toBe(false);
    dispose();
  });

  it('sets a value at a dotted array-path field name from a nested source object', () => {
    // The public name/value types stay flat (StringKeyOf<M>) for now — the
    // casts just exercise the runtime path-lookup that a future FieldArray
    // API would build on, per fieldPaths.getValueAtFieldPath.
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mutations.initializeField as any)('items.0.title', 'draft', []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutations.setValues({ items: [{ title: 'final' }] } as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((state.getFieldValue as any)('items.0.title')).toBe('final');
    dispose();
  });

  it('sets exact dotted field keys before falling back to nested path lookup', () => {
    const { store, dispose } = makeDottedStore();
    const [state, mutations] = store;
    mutations.initializeField('user.email', 'old', []);
    mutations.setValues({
      'user.email': 'literal',
      user: { email: 'nested' }
    } as unknown as Partial<DottedTestFields>);
    expect(state.getFieldValue('user.email')).toBe('literal');
    dispose();
  });
});

describe('reset', () => {
  it('reverts every field to its initial value when called with no arguments', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    mutations.initializeField('password', 'secret', []);
    mutations.setFieldValue('username', 'bob');
    mutations.setFieldValue('password', 'changed');
    mutations.reset();
    expect(state.getFieldValue('username')).toBe('alice');
    expect(state.getFieldValue('password')).toBe('secret');
    dispose();
  });

  it('clears form-level errors', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    mutations.setErrors(['Server error']);
    mutations.reset();
    expect(state.errors).toEqual([]);
    dispose();
  });

  it('clears hasChanged and hasBeenBlurred for every field', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    mutations.setFieldValue('username', 'bob');
    mutations.setBlurredField('username');
    mutations.reset();
    expect(state.hasFieldChanged('username')).toBe(false);
    expect(state.hasFieldBlurred('username')).toBe(false);
    dispose();
  });

  it('rebaselines fields passed in toValues (load-then-edit)', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', undefined, []);
    mutations.initializeField('password', undefined, []);
    mutations.reset({ username: 'loaded-alice' });
    expect(state.getFieldValue('username')).toBe('loaded-alice');
    expect(state.hasFieldChanged('username')).toBe(false);
    // A later revert-to-initial goes back to the *new* baseline, not the original undefined.
    mutations.setFieldValue('username', 'edited');
    mutations.resetField('username');
    expect(state.getFieldValue('username')).toBe('loaded-alice');
    dispose();
  });

  it('leaves fields untouched when toValues has no entry for them', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    mutations.initializeField('password', 'secret', []);
    mutations.setFieldValue('password', 'changed');
    mutations.reset({ username: 'bob' });
    expect(state.getFieldValue('username')).toBe('bob');
    expect(state.getFieldValue('password')).toBe('secret');
    dispose();
  });

  it('clears everything back to blank after a failed submit (clear-after-submit)', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', '', []);
    mutations.setFieldValue('username', 'alice');
    mutations.setFieldErrors('username', []);
    mutations.setErrors(['Submit failed']);
    mutations.reset();
    expect(state.getFieldValue('username')).toBe('');
    expect(state.errors).toEqual([]);
    expect(state.hasFieldChanged('username')).toBe(false);
    dispose();
  });

  it('ignores keys in toValues for fields that are not registered', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    expect(() => mutations.reset({ username: 'bob', password: 'ignored' })).not.toThrow();
    expect(state.getField('password')).toBeUndefined();
    dispose();
  });

  it('marks wasReset true for every field it reverts', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    mutations.initializeField('password', 'secret', []);
    mutations.reset();
    expect(state.getField('username')?.wasReset).toBe(true);
    expect(state.getField('password')?.wasReset).toBe(true);
    dispose();
  });

  it('rebaselines a dotted array-path field name from a nested toValues object', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mutations.initializeField as any)('items.0.title', undefined, []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutations.reset({ items: [{ title: 'loaded' }] } as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((state.getFieldValue as any)('items.0.title')).toBe('loaded');
    dispose();
  });

  it('rebaselines exact dotted field keys before falling back to nested path lookup', () => {
    const { store, dispose } = makeDottedStore();
    const [state, mutations] = store;
    mutations.initializeField('user.email', 'old', []);
    mutations.reset({
      'user.email': 'literal',
      user: { email: 'nested' }
    } as unknown as Partial<DottedTestFields>);
    expect(state.getFieldValue('user.email')).toBe('literal');
    mutations.setFieldValue('user.email', 'edited');
    mutations.resetField('user.email');
    expect(state.getFieldValue('user.email')).toBe('literal');
    dispose();
  });
});

describe('wasReset', () => {
  it('is not touched by a normal setFieldValue call', () => {
    const { store, dispose } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('username', 'alice', []);
    mutations.resetField('username');
    expect(state.getField('username')?.wasReset).toBe(true);
    // setFieldValue never bumps generation, so it has no reason to update
    // wasReset either — it stays whatever the last generation-bumping write left it as.
    mutations.setFieldValue('username', 'bob');
    expect(state.getField('username')?.wasReset).toBe(true);
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
