import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/types/index';
import {
  escapeSpecialChars,
  validateDateValue,
  validateLimit,
  validateNonEmptyString,
  validateNonNegativeNumber,
  validateOffset,
  validatePositiveNumber,
} from '../../src/utils/validators';

describe('validators', () => {
  describe('validateNonEmptyString', () => {
    it('should accept valid non-empty strings', () => {
      expect(validateNonEmptyString('test', 'field')).toBe('test');
      expect(validateNonEmptyString('  test  ', 'field')).toBe('  test  ');
    });

    it('should reject empty strings', () => {
      expect(() => validateNonEmptyString('', 'field')).toThrow(ValidationError);
      expect(() => validateNonEmptyString('   ', 'field')).toThrow(ValidationError);
    });

    it('should reject non-strings', () => {
      expect(() => validateNonEmptyString(123, 'field')).toThrow(ValidationError);
      expect(() => validateNonEmptyString(null, 'field')).toThrow(ValidationError);
    });
  });

  describe('validatePositiveNumber', () => {
    it('should accept positive numbers', () => {
      expect(validatePositiveNumber(1, 'field')).toBe(1);
      expect(validatePositiveNumber(100.5, 'field')).toBe(100.5);
    });

    it('should reject zero and negative numbers', () => {
      expect(() => validatePositiveNumber(0, 'field')).toThrow(ValidationError);
      expect(() => validatePositiveNumber(-1, 'field')).toThrow(ValidationError);
    });

    it('should reject non-finite numbers', () => {
      expect(() => validatePositiveNumber(Number.POSITIVE_INFINITY, 'field')).toThrow(
        ValidationError
      );
      expect(() => validatePositiveNumber(Number.NaN, 'field')).toThrow(ValidationError);
    });
  });

  describe('validateNonNegativeNumber', () => {
    it('should accept zero and positive numbers', () => {
      expect(validateNonNegativeNumber(0, 'field')).toBe(0);
      expect(validateNonNegativeNumber(100, 'field')).toBe(100);
    });

    it('should reject negative numbers', () => {
      expect(() => validateNonNegativeNumber(-1, 'field')).toThrow(ValidationError);
    });
  });

  describe('validateLimit', () => {
    it('should accept valid limits', () => {
      expect(validateLimit(1)).toBe(1);
      expect(validateLimit(200)).toBe(200);
    });

    it('should reject limits over 200', () => {
      expect(() => validateLimit(201)).toThrow(ValidationError);
    });

    it('should reject zero and negative limits', () => {
      expect(() => validateLimit(0)).toThrow(ValidationError);
      expect(() => validateLimit(-1)).toThrow(ValidationError);
    });
  });

  describe('validateOffset', () => {
    it('should accept valid offsets', () => {
      expect(validateOffset(0)).toBe(0);
      expect(validateOffset(100)).toBe(100);
    });

    it('should reject negative offsets', () => {
      expect(() => validateOffset(-1)).toThrow(ValidationError);
    });
  });

  describe('escapeSpecialChars', () => {
    it('should escape special characters', () => {
      expect(escapeSpecialChars('test+query')).toBe('test\\+query');
      expect(escapeSpecialChars('field:value')).toBe('field\\:value');
      expect(escapeSpecialChars('a b c')).toBe('a\\ b\\ c');
    });

    it('should handle strings without special characters', () => {
      expect(escapeSpecialChars('test')).toBe('test');
    });
  });

  describe('validateDateValue', () => {
    it('should handle Date objects', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      expect(validateDateValue(date)).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should handle Unix timestamps', () => {
      const result = validateDateValue(1704067200);
      expect(result).toContain('2024-01-01');
    });

    it('should handle ISO strings', () => {
      expect(validateDateValue('2024-01-01T00:00:00Z')).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should reject invalid date strings', () => {
      expect(() => validateDateValue('invalid')).toThrow(ValidationError);
    });
  });
});
