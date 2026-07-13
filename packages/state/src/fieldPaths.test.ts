import { describe, expect, it } from 'vitest';

import {
  buildObjectFromFieldEntries,
  getValueAtFieldPath,
  shiftFieldArrayIndex,
  splitFieldPath
} from './fieldPaths';

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

describe('shiftFieldArrayIndex', () => {
  it('shifts a matching index down (remove-below case)', () => {
    expect(shiftFieldArrayIndex('items.2.title', 'items', (i) => i - 1)).toBe('items.1.title');
  });

  it('shifts a matching index up (insert-below case)', () => {
    expect(shiftFieldArrayIndex('items.2.title', 'items', (i) => i + 1)).toBe('items.3.title');
  });

  it('preserves a nested sub-path under the shifted item', () => {
    expect(shiftFieldArrayIndex('items.2.tags.0', 'items', (i) => i - 1)).toBe('items.1.tags.0');
  });

  it('shifts a bare index with no trailing sub-path', () => {
    expect(shiftFieldArrayIndex('items.2', 'items', (i) => i - 1)).toBe('items.1');
  });

  it('returns null (remove) when shift returns null', () => {
    expect(shiftFieldArrayIndex('items.0.title', 'items', () => null)).toBeNull();
  });

  it('leaves a name that does not belong to this array unchanged', () => {
    expect(shiftFieldArrayIndex('email', 'items', (i) => i - 1)).toBe('email');
    expect(shiftFieldArrayIndex('otherArray.0.title', 'items', (i) => i - 1)).toBe('otherArray.0.title');
  });

  it('does not confuse a field that merely starts with the array name', () => {
    expect(shiftFieldArrayIndex('itemsCount', 'items', (i) => i - 1)).toBe('itemsCount');
  });

  it('regex-escapes the array name so a literal dot cannot misfire on an unrelated field', () => {
    expect(shiftFieldArrayIndex('axb.0', 'a.b', (i) => i - 1)).toBe('axb.0');
    expect(shiftFieldArrayIndex('a.b.0.title', 'a.b', (i) => i + 1)).toBe('a.b.1.title');
  });

  it('does not shift an index belonging to a different array with a shared prefix', () => {
    expect(shiftFieldArrayIndex('itemsArchive.0.title', 'items', (i) => i - 1)).toBe('itemsArchive.0.title');
  });
});
