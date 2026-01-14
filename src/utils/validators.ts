/**
 * Validation utilities
 */

import { ValidationError } from '../types/index.js';

/**
 * Validates that a value is a non-empty string
 */
export const validateNonEmptyString = (value: unknown, fieldName: string): string => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ValidationError(`${fieldName} must be a non-empty string`, fieldName);
  }
  return value;
};

/**
 * Validates that a value is a positive number
 */
export const validatePositiveNumber = (value: unknown, fieldName: string): number => {
  if (typeof value !== 'number' || value <= 0 || !Number.isFinite(value)) {
    throw new ValidationError(`${fieldName} must be a positive number`, fieldName);
  }
  return value;
};

/**
 * Validates that a value is a non-negative number
 */
export const validateNonNegativeNumber = (value: unknown, fieldName: string): number => {
  if (typeof value !== 'number' || value < 0 || !Number.isFinite(value)) {
    throw new ValidationError(`${fieldName} must be a non-negative number`, fieldName);
  }
  return value;
};

/**
 * Validates search limit
 */
export const validateLimit = (limit: number): number => {
  validatePositiveNumber(limit, 'limit');
  if (limit > 200) {
    throw new ValidationError('limit cannot exceed 200', 'limit');
  }
  return limit;
};

/**
 * Validates search offset
 */
export const validateOffset = (offset: number): number => {
  return validateNonNegativeNumber(offset, 'offset');
};

/**
 * Escapes special characters in query strings
 */
export const escapeSpecialChars = (value: string): string => {
  const specialChars = /[+,^`:{}"\[\]()~!\\* ]/g;
  return value.replace(specialChars, '\\$&');
};

/**
 * Validates and formats a date value for queries
 */
export const validateDateValue = (value: string | number | Date): string => {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'number') {
    // Unix timestamp
    return new Date(value * 1000).toISOString();
  }

  if (typeof value === 'string') {
    // Validate RFC3339 format or Unix timestamp
    const timestamp = Number(value);
    if (!Number.isNaN(timestamp)) {
      return new Date(timestamp * 1000).toISOString();
    }

    // Try to parse as ISO string
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new ValidationError('Invalid date format. Use RFC3339 or Unix timestamp', 'date');
    }
    return date.toISOString();
  }

  throw new ValidationError('Date must be a string, number, or Date object', 'date');
};
