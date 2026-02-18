import { describe, expect, it, vi } from 'vitest';
import { MeasureApi } from '../../src/api/measure';
import type { HttpClient } from '../../src/core/http';
import { createApiKey } from '../../src/types/index';
import type { MeasureRequest } from '../../src/types/index';

describe('MeasureApi', () => {
  const mockConfig = {
    endpointUrl: 'http://localhost:8000',
    readKey: createApiKey('test-read-key'),
    ingestKey: createApiKey('test-ingest-key'),
    timeout: 30000,
  };

  const mockHttpClient: HttpClient = {
    request: vi.fn(),
  };

  const sampleEvent: MeasureRequest = {
    event_name: 'search',
    properties: {
      searchcraft_index_names: ['products'],
      search_term: 'laptop',
      number_of_documents: 10,
    },
    user: {
      user_id: 'user-123',
    },
  };

  describe('getDashboardSummary', () => {
    it('should return the dashboard summary', async () => {
      const mockData = { total_searches: 100, total_clicks: 50 };
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: mockData,
        headers: {},
      });

      const api = new MeasureApi(mockConfig, mockHttpClient);
      const result = await api.getDashboardSummary();

      expect(result).toEqual(mockData);
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: 'http://localhost:8000/measure/dashboard/summary',
        }),
        'test-read-key'
      );
    });

    it('should use the read key for getDashboardSummary', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: {},
        headers: {},
      });

      const api = new MeasureApi(mockConfig, mockHttpClient);
      await api.getDashboardSummary();

      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.anything(),
        'test-read-key'
      );
    });
  });

  describe('trackEvent', () => {
    it('should track a single measure event', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: 'event tracked',
        headers: {},
      });

      const api = new MeasureApi(mockConfig, mockHttpClient);
      const result = await api.trackEvent(sampleEvent);

      expect(result).toBe('event tracked');
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: 'http://localhost:8000/measure/event',
          body: sampleEvent,
        }),
        'test-ingest-key'
      );
    });

    it('should use the ingest key for trackEvent', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: 'ok',
        headers: {},
      });

      const api = new MeasureApi(mockConfig, mockHttpClient);
      await api.trackEvent(sampleEvent);

      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.anything(),
        'test-ingest-key'
      );
    });
  });

  describe('trackBatch', () => {
    it('should track a batch of measure events', async () => {
      const events = [sampleEvent, { ...sampleEvent, event_name: 'click' }];
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: 'batch tracked',
        headers: {},
      });

      const api = new MeasureApi(mockConfig, mockHttpClient);
      const result = await api.trackBatch(events);

      expect(result).toBe('batch tracked');
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: 'http://localhost:8000/measure/batch',
          body: events,
        }),
        'test-ingest-key'
      );
    });

    it('should use the ingest key for trackBatch', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: 'ok',
        headers: {},
      });

      const api = new MeasureApi(mockConfig, mockHttpClient);
      await api.trackBatch([sampleEvent]);

      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.anything(),
        'test-ingest-key'
      );
    });
  });
});

