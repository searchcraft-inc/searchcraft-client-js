import { describe, expect, it, vi } from 'vitest';
import { AuthApi } from '../../src/api/auth';
import type { HttpClient } from '../../src/core/http';
import type { AuthKey, CreateAuthKeyRequest, UpdateAuthKeyRequest } from '../../src/types/index';
import {
  AuthenticationError,
  createApiKey,
  createFederationName,
  createIndexName,
  permissions,
} from '../../src/types/index';

describe('AuthApi', () => {
  const mockConfig = {
    endpointUrl: 'http://localhost:8000',
    readKey: createApiKey('test-read-key'),
    ingestKey: createApiKey('test-ingest-key'),
    adminKey: createApiKey('test-admin-key'),
    timeout: 30000,
  };

  const mockHttpClient: HttpClient = {
    request: vi.fn(),
    stream: vi.fn(),
  };

  const sampleAuthKey: AuthKey = {
    token: 'abc123',
    name: 'Test Key',
    permissions: 1,
    allowed_indexes: ['products'],
    status: 'active',
  };

  describe('listKeys', () => {
    it('should list all keys using GET /auth/key with admin key', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: [sampleAuthKey] },
        headers: {},
      });

      const api = new AuthApi(mockConfig, mockHttpClient);
      const result = await api.listKeys();

      expect(result).toEqual([sampleAuthKey]);
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'GET', path: 'http://localhost:8000/auth/key' }),
        'test-admin-key'
      );
    });
  });

  describe('getKey', () => {
    it('should get a key by value using GET /auth/key/:key with admin key', async () => {
      // The engine answers this route with a list, not a single object.
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: [sampleAuthKey] },
        headers: {},
      });

      const api = new AuthApi(mockConfig, mockHttpClient);
      const result = await api.getKey('abc123');

      expect(result).toEqual(sampleAuthKey);
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'GET', path: 'http://localhost:8000/auth/key/abc123' }),
        'test-admin-key'
      );
    });

    it('should return null when no such key exists', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: [] },
        headers: {},
      });

      const api = new AuthApi(mockConfig, mockHttpClient);
      expect(await api.getKey('missing')).toBeNull();
    });
  });

  describe('checkKeyPermissions', () => {
    it('should return true when the key carries the requested bits', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: 'Key has sufficient permissions.' },
        headers: {},
      });

      const api = new AuthApi(mockConfig, mockHttpClient);
      expect(await api.checkKeyPermissions(permissions.SEARCH)).toBe(true);
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: 'http://localhost:8000/auth/key/check/1',
        }),
        'test-admin-key'
      );
    });

    it('should map a 403 to false rather than throwing', async () => {
      vi.mocked(mockHttpClient.request).mockRejectedValueOnce(
        new AuthenticationError('Key has insufficient permissions.')
      );

      const api = new AuthApi(mockConfig, mockHttpClient);
      expect(await api.checkKeyPermissions(permissions.READ_ANALYTICS)).toBe(false);
    });
  });

  describe('createKey', () => {
    it('should create a key using POST /auth/key with body and admin key', async () => {
      const request: CreateAuthKeyRequest = {
        name: 'New Key',
        permissions: 1,
        allowed_indexes: ['products'],
        status: 'active',
      };
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: sampleAuthKey },
        headers: {},
      });

      const api = new AuthApi(mockConfig, mockHttpClient);
      const result = await api.createKey(request);

      expect(result).toEqual(sampleAuthKey);
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: 'http://localhost:8000/auth/key',
          body: request,
        }),
        'test-admin-key'
      );
    });
  });

  describe('updateKey', () => {
    it('should update a key using POST /auth/key/:key with body and admin key', async () => {
      const request: UpdateAuthKeyRequest = { status: 'inactive' };
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: { ...sampleAuthKey, status: 'inactive' } },
        headers: {},
      });

      const api = new AuthApi(mockConfig, mockHttpClient);
      await api.updateKey('abc123', request);

      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: 'http://localhost:8000/auth/key/abc123',
          body: request,
        }),
        'test-admin-key'
      );
    });
  });

  describe('deleteKey', () => {
    it('should delete a key using DELETE /auth/key/:key with admin key', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: 'key deleted' },
        headers: {},
      });

      const api = new AuthApi(mockConfig, mockHttpClient);
      const result = await api.deleteKey('abc123');

      expect(result).toBe('key deleted');
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          path: 'http://localhost:8000/auth/key/abc123',
        }),
        'test-admin-key'
      );
    });
  });

  describe('deleteAllKeys', () => {
    it('should delete all keys using DELETE /auth/key with admin key', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: 'all keys deleted' },
        headers: {},
      });

      const api = new AuthApi(mockConfig, mockHttpClient);
      const result = await api.deleteAllKeys();

      expect(result).toBe('all keys deleted');
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'DELETE', path: 'http://localhost:8000/auth/key' }),
        'test-admin-key'
      );
    });
  });

  describe('listApplicationKeys', () => {
    it('should list application keys using GET /auth/application/:id with admin key', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: [sampleAuthKey] },
        headers: {},
      });

      const api = new AuthApi(mockConfig, mockHttpClient);
      const result = await api.listApplicationKeys('42');

      expect(result).toEqual([sampleAuthKey]);
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: 'http://localhost:8000/auth/application/42',
        }),
        'test-admin-key'
      );
    });
  });

  describe('listOrganizationKeys', () => {
    it('should list organization keys using GET /auth/organization/:id with admin key', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: [sampleAuthKey] },
        headers: {},
      });

      const api = new AuthApi(mockConfig, mockHttpClient);
      const result = await api.listOrganizationKeys('7');

      expect(result).toEqual([sampleAuthKey]);
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: 'http://localhost:8000/auth/organization/7',
        }),
        'test-admin-key'
      );
    });
  });

  describe('listFederationKeys', () => {
    it('should list federation keys using GET /auth/federation/:name with admin key', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: [sampleAuthKey] },
        headers: {},
      });

      const api = new AuthApi(mockConfig, mockHttpClient);
      const result = await api.listFederationKeys(createFederationName('my-federation'));

      expect(result).toEqual([sampleAuthKey]);
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: 'http://localhost:8000/auth/federation/my-federation',
        }),
        'test-admin-key'
      );
    });
  });

  describe('listIndexKeys', () => {
    it('should list index keys using GET /auth/index/:index_name with admin key', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: [sampleAuthKey] },
        headers: {},
      });

      const api = new AuthApi(mockConfig, mockHttpClient);
      const result = await api.listIndexKeys(createIndexName('products'));

      expect(result).toEqual([sampleAuthKey]);
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: 'http://localhost:8000/auth/index/products',
        }),
        'test-admin-key'
      );
    });

    it('should percent-encode the index name in the path', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: [sampleAuthKey] },
        headers: {},
      });

      const api = new AuthApi(mockConfig, mockHttpClient);
      await api.listIndexKeys(createIndexName('my index/slash'));

      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: 'http://localhost:8000/auth/index/my%20index%2Fslash',
        }),
        'test-admin-key'
      );
    });

    it('should propagate errors from the http client', async () => {
      vi.mocked(mockHttpClient.request).mockRejectedValueOnce(new Error('not found'));

      const api = new AuthApi(mockConfig, mockHttpClient);
      await expect(api.listIndexKeys(createIndexName('missing'))).rejects.toThrow('not found');
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: 'http://localhost:8000/auth/index/missing',
        }),
        'test-admin-key'
      );
    });
  });
});
