import { describe, expect, it } from 'vitest';
import {
  ApiError,
  AuthenticationError,
  ConfigurationError,
  NetworkError,
  NotFoundError,
  SearchcraftError,
  ValidationError,
} from '../../src/types/errors.js';

describe('Error Classes', () => {
  describe('SearchcraftError', () => {
    it('should create a base error with message and code', () => {
      const error = new SearchcraftError('Test error', 'TEST_CODE');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.name).toBe('SearchcraftError');
      expect(error.statusCode).toBeUndefined();
    });

    it('should create a base error with status code', () => {
      const error = new SearchcraftError('Test error', 'TEST_CODE', 500);
      expect(error.statusCode).toBe(500);
    });
  });

  describe('ValidationError', () => {
    it('should create a validation error', () => {
      const error = new ValidationError('Invalid input');
      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.name).toBe('ValidationError');
      expect(error instanceof SearchcraftError).toBe(true);
    });

    it('should create a validation error with field', () => {
      const error = new ValidationError('Invalid input', 'email');
      expect(error.field).toBe('email');
    });
  });

  describe('AuthenticationError', () => {
    it('should create an authentication error', () => {
      const error = new AuthenticationError('Invalid API key');
      expect(error.message).toBe('Invalid API key');
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.name).toBe('AuthenticationError');
      expect(error instanceof SearchcraftError).toBe(true);
    });

    it('should use default message', () => {
      const error = new AuthenticationError();
      expect(error.message).toBe('Authentication failed');
    });
  });

  describe('NotFoundError', () => {
    it('should create a not found error', () => {
      const error = new NotFoundError('Resource not found');
      expect(error.message).toBe('Resource not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.name).toBe('NotFoundError');
      expect(error instanceof SearchcraftError).toBe(true);
    });

    it('should use default message', () => {
      const error = new NotFoundError();
      expect(error.message).toBe('Resource not found');
    });
  });

  describe('ConfigurationError', () => {
    it('should create a configuration error', () => {
      const error = new ConfigurationError('Invalid config');
      expect(error.message).toBe('Invalid config');
      expect(error.code).toBe('CONFIGURATION_ERROR');
      expect(error.name).toBe('ConfigurationError');
      expect(error instanceof SearchcraftError).toBe(true);
    });

    it('should create a configuration error with different message', () => {
      const error = new ConfigurationError('Missing API key');
      expect(error.message).toBe('Missing API key');
    });
  });

  describe('NetworkError', () => {
    it('should create a network error', () => {
      const error = new NetworkError('Connection failed');
      expect(error.message).toBe('Connection failed');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.name).toBe('NetworkError');
      expect(error instanceof SearchcraftError).toBe(true);
    });

    it('should use default message', () => {
      const error = new NetworkError();
      expect(error.message).toBe('Network request failed');
    });
  });

  describe('ApiError', () => {
    it('should create an API error with response', () => {
      const response = { error: 'Bad request' };
      const error = new ApiError('Request failed', 400, response);
      expect(error.message).toBe('Request failed');
      expect(error.code).toBe('API_ERROR');
      expect(error.name).toBe('ApiError');
      expect(error.statusCode).toBe(400);
      expect(error.response).toEqual(response);
      expect(error instanceof SearchcraftError).toBe(true);
    });

    it('should create an API error without response', () => {
      const error = new ApiError('Request failed', 500);
      expect(error.response).toBeUndefined();
    });
  });
});
