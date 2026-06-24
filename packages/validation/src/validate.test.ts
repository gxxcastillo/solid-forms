import { type FormState } from '@gxxc/solid-forms-state';
import { describe, expect, it } from 'vitest';

import { validate } from './validate';

type TestFields = { username: string; password: string; age: number };

function makeFormState(fields: Partial<TestFields> = {}): FormState<TestFields> {
  return {
    fields: [],
    errors: [],
    isReady: true,
    isLoading: false,
    isProcessing: false,
    haveValuesChanged: false,
    isFormValid: true,
    isFieldValid: () => undefined,
    getField: () => undefined,
    getFieldValue: (name: string) => fields[name as keyof TestFields] as never,
    getFieldErrors: () => undefined,
    hasFieldBeenInitialized: (name: string) => name in fields,
    hasFieldBeenValid: () => undefined,
    hasFieldChanged: () => undefined,
    hasFieldBlurred: () => undefined
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

describe('validate — falsey constraints', () => {
  it('skips required={false}', () => {
    expect(validate('username', '', { required: false }, makeFormState())).toEqual([]);
  });

  it('skips undefined constraints', () => {
    expect(validate('username', '', { pattern: undefined }, makeFormState())).toEqual([]);
  });

  it('enforces required={true}', () => {
    expect(validate('username', '', { required: true }, makeFormState())).toHaveLength(1);
  });

  it('treats min=0 as active (not falsey)', () => {
    expect(validate('age', -1 as never, { min: 0 }, makeFormState())).toHaveLength(1);
  });

  it('treats max=0 as active (not falsey)', () => {
    expect(validate('age', 1 as never, { max: 0 }, makeFormState())).toHaveLength(1);
  });

  it('passes max=0 when value is 0', () => {
    expect(validate('age', 0 as never, { max: 0 }, makeFormState())).toEqual([]);
  });

  it('treats minLength=0 as active (not falsey)', () => {
    expect(validate('username', '', { minLength: 0 }, makeFormState())).toEqual([]);
  });
});

describe('required', () => {
  const state = makeFormState();

  it('fails for empty string', () => {
    expect(validate('username', '', { required: true }, state)).toHaveLength(1);
  });

  it('fails for undefined', () => {
    expect(validate('username', undefined, { required: true }, state)).toHaveLength(1);
  });

  it('fails for empty array', () => {
    expect(validate('username', [] as never, { required: true }, state)).toHaveLength(1);
  });

  it('passes for a non-empty string', () => {
    expect(validate('username', 'alice', { required: true }, state)).toEqual([]);
  });

  it('passes for a non-empty array', () => {
    expect(validate('username', ['a'] as never, { required: true }, state)).toEqual([]);
  });
});

describe('pattern', () => {
  const state = makeFormState();

  it('passes for a matching string pattern', () => {
    expect(validate('username', 'alice123', { pattern: '^[a-z0-9]+$' }, state)).toEqual([]);
  });

  it('fails for a non-matching string pattern', () => {
    expect(validate('username', 'ALICE', { pattern: '^[a-z0-9]+$' }, state)).toHaveLength(1);
  });

  it('accepts a RegExp pattern', () => {
    expect(validate('username', 'alice123', { pattern: /^[a-z0-9]+$/ }, state)).toEqual([]);
  });

  it('fails for a non-matching RegExp', () => {
    expect(validate('username', 'ALICE', { pattern: /^[a-z0-9]+$/ }, state)).toHaveLength(1);
  });

  it('caches compiled string patterns (no throw on repeated calls)', () => {
    const pattern = '^[a-z]+$';
    expect(validate('username', 'abc', { pattern }, state)).toEqual([]);
    expect(validate('username', 'def', { pattern }, state)).toEqual([]);
    expect(validate('username', 'ABC', { pattern }, state)).toHaveLength(1);
  });
});

describe('minLength / maxLength', () => {
  const state = makeFormState();

  it('minLength passes when string meets the minimum', () => {
    expect(validate('username', 'abc', { minLength: 3 }, state)).toEqual([]);
  });

  it('minLength fails when string is too short', () => {
    expect(validate('username', 'ab', { minLength: 3 }, state)).toHaveLength(1);
  });

  it('maxLength passes when string is within the limit', () => {
    expect(validate('username', 'ab', { maxLength: 5 }, state)).toEqual([]);
  });

  it('maxLength fails when string exceeds the limit', () => {
    expect(validate('username', 'abcdef', { maxLength: 5 }, state)).toHaveLength(1);
  });
});

describe('min / max', () => {
  const state = makeFormState();

  it('min passes when value equals the minimum', () => {
    expect(validate('age', 5 as never, { min: 5 }, state)).toEqual([]);
  });

  it('min fails when value is below the minimum', () => {
    expect(validate('age', 4 as never, { min: 5 }, state)).toHaveLength(1);
  });

  it('max passes when value equals the maximum', () => {
    expect(validate('age', 5 as never, { max: 5 }, state)).toEqual([]);
  });

  it('max fails when value exceeds the maximum', () => {
    expect(validate('age', 6 as never, { max: 5 }, state)).toHaveLength(1);
  });
});

describe('match — cross-field validation', () => {
  it('passes when both fields have the same value', () => {
    const state = makeFormState({ password: 'secret' });
    expect(validate('username', 'secret', { match: 'password' }, state)).toEqual([]);
  });

  it('fails when the values differ', () => {
    const state = makeFormState({ password: 'secret' });
    expect(validate('username', 'wrong', { match: 'password' }, state)).toHaveLength(1);
  });

  it('passes when the target field has not been initialized yet', () => {
    const state = makeFormState({});
    expect(validate('username', 'val', { match: 'password' }, state)).toEqual([]);
  });

  it('passes when match is undefined', () => {
    const state = makeFormState({});
    expect(validate('username', 'val', { match: undefined }, state)).toEqual([]);
  });
});

describe('multiple constraints', () => {
  it('collects errors from all failing constraints', () => {
    const state = makeFormState();
    const errors = validate('username', '', { required: true, minLength: 3 }, state);
    expect(errors).toHaveLength(2);
  });

  it('returns an empty array when all constraints pass', () => {
    const state = makeFormState();
    const errors = validate('username', 'alice', { required: true, minLength: 3, maxLength: 10 }, state);
    expect(errors).toEqual([]);
  });

  it('skips disabled constraints alongside active ones', () => {
    const state = makeFormState();
    const errors = validate('username', 'alice', { required: false, minLength: 3 }, state);
    expect(errors).toEqual([]);
  });
});
