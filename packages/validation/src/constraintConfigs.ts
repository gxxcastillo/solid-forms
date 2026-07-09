import { type StringKeyOf } from 'type-fest';

import { type FormState } from '@gxxc/solid-forms-state';

import { type ConstraintConfigs, type ConstraintName } from './types';

const PATTERN_CACHE_LIMIT = 100;
const patternCache = new Map<string, RegExp>();

function getCompiledPattern(pattern: string | RegExp): RegExp {
  if (pattern instanceof RegExp) {
    // Drop the stateful global/sticky flags: RegExp.test() advances lastIndex on
    // g/y patterns, which makes validation of the same value flip-flop between
    // calls when the RegExp instance is reused across renders.
    if (pattern.global || pattern.sticky) {
      return new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, ''));
    }
    return pattern;
  }
  let re = patternCache.get(pattern);
  if (!re) {
    re = new RegExp(pattern);
    // Keep the cache bounded — evict the oldest entry (Map preserves insertion
    // order) so an app with many distinct patterns can't grow it without limit.
    if (patternCache.size >= PATTERN_CACHE_LIMIT) {
      const oldest = patternCache.keys().next().value;
      if (oldest !== undefined) patternCache.delete(oldest);
    }
    patternCache.set(pattern, re);
  }
  return re;
}

// Coerce a field value to a number for the numeric `min`/`max` constraints.
// Field values are strings by default (the raw DOM value) and only become
// numbers when a custom `parse` is supplied, so both shapes must be accepted.
// Empty and non-numeric values yield `undefined` (the constraint is skipped) —
// emptiness is `required`'s concern, not `min`/`max`'s.
function toNumber(val: unknown): number | undefined {
  if (typeof val === 'number') return Number.isNaN(val) ? undefined : val;
  if (typeof val === 'string' && val.trim() !== '') {
    const parsed = Number(val);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

export const constraintConfigs: ConstraintConfigs = {
  match: {
    validate: <M extends object>(val: unknown, matchFieldName: unknown, formState: FormState<M>) => {
      if (typeof matchFieldName !== 'string') return true;
      const name = matchFieldName as StringKeyOf<M>;
      if (!formState.hasFieldBeenInitialized(name)) return true;
      return val === formState.getFieldValue(name);
    },
    message: <M extends object>(fieldName: string, matchFieldName: unknown, formState: FormState<M>) => {
      const matchLabel =
        (typeof matchFieldName === 'string' && formState.getField(matchFieldName as StringKeyOf<M>)?.label) ||
        String(matchFieldName);
      return `"${fieldName}" does not match "${matchLabel}"`;
    }
  },

  required: {
    // `false` is an unsatisfied value (an unchecked required checkbox), not a
    // present one, so it must fail alongside `undefined`/`null`/`''`.
    validate: (val) => (Array.isArray(val) ? val.length > 0 : val != null && val !== '' && val !== false),
    message: (fieldName) => `"${fieldName}" is required`
  },

  pattern: {
    validate: (val, pattern) => {
      if (typeof pattern !== 'string' && !(pattern instanceof RegExp)) return false;
      // Emptiness is `required`'s concern; an absent value can't violate a pattern.
      if (val === undefined || val === null || val === '') return true;
      return getCompiledPattern(pattern).test(String(val));
    },
    message: (fieldName) => `"${fieldName}" is invalid`
  },

  minLength: {
    validate: (val, minLength) =>
      typeof val === 'string' && typeof minLength === 'number' && val.length >= minLength,
    message: (fieldName) => `"${fieldName}" is too short`
  },

  maxLength: {
    validate: (val, maxLength) =>
      typeof val === 'string' && typeof maxLength === 'number' && val.length <= maxLength,
    message: (fieldName) => `"${fieldName}" is too long`
  },

  min: {
    validate: (val, min) => {
      if (typeof min !== 'number') return true;
      const num = toNumber(val);
      return num === undefined || num >= min;
    },
    message: (fieldName: string) => `"${fieldName}" is too small`
  },

  max: {
    validate: (val, max) => {
      if (typeof max !== 'number') return true;
      const num = toNumber(val);
      return num === undefined || num <= max;
    },
    message: (fieldName: string) => `"${fieldName}" is too large`
  }
} as const;

export const constraintNames = Object.keys(constraintConfigs) as ConstraintName[];
