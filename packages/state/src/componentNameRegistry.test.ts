import { describe, expect, it } from 'vitest';

import { getComponentName, setComponentName } from './componentNameRegistry';

describe('componentNameRegistry', () => {
  it('returns the name set for an element', () => {
    const el = {};
    setComponentName(el, 'InputField');
    expect(getComponentName(el)).toBe('InputField');
  });

  it('returns undefined for an element that was never tagged', () => {
    expect(getComponentName({})).toBeUndefined();
  });

  it('keeps names for distinct elements independent', () => {
    const a = {};
    const b = {};
    setComponentName(a, 'InputField');
    setComponentName(b, 'SubmitButton');

    expect(getComponentName(a)).toBe('InputField');
    expect(getComponentName(b)).toBe('SubmitButton');
  });
});
