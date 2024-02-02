import { type ConstraintConfigs, type ConstraintName } from './types';

export const constraintConfigs: ConstraintConfigs = {
  match: {
    validate: (val, matchFieldName, { getFieldValue }) =>
      typeof matchFieldName === 'string' ? val === getFieldValue(matchFieldName) : true,
    message: (fieldName, matchFieldName) => `"${fieldName}" does not match "${matchFieldName}"`
  },

  required: {
    validate: (val) => (Array.isArray(val) ? val.length > 0 : val !== undefined && val !== ''),
    message: (fieldName) => `"${fieldName}" is required`
  },

  pattern: {
    validate: (val, pattern) =>
      typeof val === 'string' && typeof pattern === 'string' && new RegExp(pattern).test(val),
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
    validate: (val, min) => typeof val === 'number' && typeof min === 'number' && val >= min,
    message: (fieldName: string) => `"${fieldName}" is too small`
  },

  max: {
    validate: (val, max) => typeof val === 'number' && typeof max === 'number' && val <= max,
    message: (fieldName: string) => `"${fieldName}" is too large`
  }
} as const;

export const constraintNames = Object.keys(constraintConfigs) as ConstraintName[];
