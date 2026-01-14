import { describe, expect, it, vi } from 'vitest';
import { HealthApi } from '../../src/api/health';
import type { HttpClient } from '../../src/core/http';
import { createApiKey } from '../../src/types/index';

describe('HealthApi', () => {
  const mockConfig = {
    endpointUrl: 'http://localhost:8000',
    readKey: createApiKey('test-read-key'),
    timeout: 30000,
  };

  const mockHttpClient: HttpClient = {
    request: vi.fn(),
  };

  describe('check', () => {
    it('should perform a health check', async () => {
      const mockData = {
        healthy: true,
        version: '1.0.0',
        uptime: 12345,
      };

      const mockResponse = {
        status: 200,
        data: mockData,
      };

      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockResponse);

      const api = new HealthApi(mockConfig, mockHttpClient);
      const result = await api.check();

      expect(result).toEqual(mockData);
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: 'http://localhost:8000/healthcheck',
        }),
        'test-read-key'
      );
    });
  });
});
