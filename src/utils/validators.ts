/**
 * Validation utilities
 */

import { ValidationError } from '../types/index.js';

/**
 * Validates that a value is a non-empty string.
 * @param value - The value to validate.
 * @param fieldName - The field name used in the error message.
 * @returns The validated string value.
 * @throws {ValidationError} When `value` is not a string or is blank.
 */
export const validateNonEmptyString = (value: unknown, fieldName: string): string => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ValidationError(`${fieldName} must be a non-empty string`, fieldName);
  }
  return value;
};

/**
 * Validates that a value is a positive finite number (greater than zero).
 * @param value - The value to validate.
 * @param fieldName - The field name used in the error message.
 * @returns The validated number.
 * @throws {ValidationError} When `value` is not a positive finite number.
 */
export const validatePositiveNumber = (value: unknown, fieldName: string): number => {
  if (typeof value !== 'number' || value <= 0 || !Number.isFinite(value)) {
    throw new ValidationError(`${fieldName} must be a positive number`, fieldName);
  }
  return value;
};

/**
 * Validates that a value is a non-negative finite number (zero or greater).
 * @param value - The value to validate.
 * @param fieldName - The field name used in the error message.
 * @returns The validated number.
 * @throws {ValidationError} When `value` is not a non-negative finite number.
 */
export const validateNonNegativeNumber = (value: unknown, fieldName: string): number => {
  if (typeof value !== 'number' || value < 0 || !Number.isFinite(value)) {
    throw new ValidationError(`${fieldName} must be a non-negative number`, fieldName);
  }
  return value;
};

/**
 * Validates a search `limit` value (must be a positive number no greater than 200).
 * @param limit - The limit value to validate.
 * @returns The validated limit.
 * @throws {ValidationError} When `limit` is not a positive number or exceeds 200.
 */
export const validateLimit = (limit: number): number => {
  validatePositiveNumber(limit, 'limit');
  if (limit > 200) {
    throw new ValidationError('limit cannot exceed 200', 'limit');
  }
  return limit;
};

/**
 * Validates a search `offset` value (must be a non-negative number).
 * @param offset - The offset value to validate.
 * @returns The validated offset.
 * @throws {ValidationError} When `offset` is negative or not a finite number.
 */
export const validateOffset = (offset: number): number => {
  return validateNonNegativeNumber(offset, 'offset');
};

/**
 * Escapes special characters in query strings so they are treated as literals.
 * @param value - The raw query string to escape.
 * @returns The escaped string safe to use in a Searchcraft query.
 */
export const escapeSpecialChars = (value: string): string => {
  const specialChars = /[+,^`:{}"[\]()~!\\* ]/g;
  return value.replace(specialChars, '\\$&');
};

/**
 * Validates and formats a date value for use in Searchcraft queries.
 * Accepts a `Date` object, a Unix timestamp (number of seconds), or an ISO 8601 / RFC 3339 string.
 * @param value - The date to validate and format.
 * @returns The date as an ISO 8601 string.
 * @throws {ValidationError} When `value` is a string that cannot be parsed as a date or timestamp.
 * @throws {ValidationError} When `value` is not a string, number, or Date.
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
