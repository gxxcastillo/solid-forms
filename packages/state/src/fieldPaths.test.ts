import { describe, expect, it } from 'vitest';

import { buildObjectFromFieldEntries, getValueAtFieldPath, splitFieldPath } from './fieldPaths';

describe('splitFieldPath', () => {
  it('splits on dots', () => {
    expect(splitFieldPath('items.0.title')).toEqual(['items', '0', 'title']);
  });

  it('returns a single segment for a flat name', () => {
    expect(splitFieldPath('email')).toEqual(['email']);
  });
});

describe('getValueAtFieldPath', () => {
  it('reads a flat key', () => {
    expect(getValueAtFieldPath({ email: 'a@b.com' }, 'email')).toEqual({ found: true, value: 'a@b.com' });
  });

  it('reads a nested object path', () => {
    expect(getValueAtFieldPath({ address: { city: 'NYC' } }, 'address.city')).toEqual({
      found: true,
      value: 'NYC'
    });
  });

  it('prefers an exact dotted key over a nested object path', () => {
    expect(
      getValueAtFieldPath({ 'address.city': 'literal', address: { city: 'nested' } }, 'address.city')
    ).toEqual({
      found: true,
      value: 'literal'
    });
  });

  it('reads an array-index path', () => {
    expect(getValueAtFieldPath({ items: [{ title: 'a' }, { title: 'b' }] }, 'items.1.title')).toEqual({
      found: true,
      value: 'b'
    });
  });

  it('reports not found for a missing top-level key', () => {
    expect(getValueAtFieldPath({ email: 'a@b.com' }, 'age')).toEqual({ found: false, value: undefined });
  });

  it('reports not found for a partially-missing path', () => {
    expect(getValueAtFieldPath({ items: [{ title: 'a' }] }, 'items.1.title')).toEqual({
      found: false,
      value: undefined
    });
  });

  it('distinguishes an explicit undefined value from a missing path', () => {
    expect(getValueAtFieldPath({ email: undefined }, 'email')).toEqual({ found: true, value: undefined });
  });

  it('does not descend through prototype-related path segments', () => {
    expect(getValueAtFieldPath({}, '__proto__.polluted')).toEqual({ found: false, value: undefined });
    expect(getValueAtFieldPath({}, 'constructor.prototype.polluted')).toEqual({
      found: false,
      value: undefined
    });
  });
});

describe('buildObjectFromFieldEntries', () => {
  it('builds a flat object from flat entries (matches todays fieldsToProps behavior)', () => {
    expect(
      buildObjectFromFieldEntries([
        ['email', 'a@b.com'],
        ['age', 30]
      ])
    ).toEqual({ email: 'a@b.com', age: 30 });
  });

  it('builds a nested object from dotted object-path entries', () => {
    expect(buildObjectFromFieldEntries([['address.city', 'NYC']])).toEqual({ address: { city: 'NYC' } });
  });

  it('builds a nested array from dotted array-index entries', () => {
    expect(
      buildObjectFromFieldEntries([
        ['items.0.title', 'a'],
        ['items.1.title', 'b']
      ])
    ).toEqual({ items: [{ title: 'a' }, { title: 'b' }] });
  });

  it('combines nested and flat entries in the same call', () => {
    expect(
      buildObjectFromFieldEntries([
        ['items.0.title', 'a'],
        ['items.1.title', 'b'],
        ['email', 'a@b.com']
      ])
    ).toEqual({ items: [{ title: 'a' }, { title: 'b' }], email: 'a@b.com' });
  });

  it('does not pollute object prototypes from unsafe path segments', () => {
    const result = buildObjectFromFieldEntries([
      ['__proto__.polluted', true],
      ['constructor.prototype.polluted', true]
    ]);

    expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
    expect(result).toEqual({
      '__proto__.polluted': true,
      'constructor.prototype.polluted': true
    });
  });

  it('defines a literal __proto__ field without changing the returned object prototype', () => {
    const value = { safe: true };
    const result = buildObjectFromFieldEntries([['__proto__', value]]);

    expect(Object.hasOwn(result, '__proto__')).toBe(true);
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(result['__proto__']).toBe(value);
  });
});
