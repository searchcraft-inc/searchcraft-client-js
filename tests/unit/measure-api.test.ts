import { describe, expect, it, vi } from 'vitest';
import { MeasureApi } from '../../src/api/measure';
import type { HttpClient } from '../../src/core/http';
import type { MeasureRequest } from '../../src/types/index';
import { createApiKey } from '../../src/types/index';

describe('MeasureApi', () => {
  const mockConfig = {
    endpointUrl: 'http://localhost:8000',
    readKey: createApiKey('test-read-key'),
    ingestKey: createApiKey('test-ingest-key'),
    timeout: 30000,
  };

  const mockHttpClient: HttpClient = {
    request: vi.fn(),
    stream: vi.fn(),
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

  describe('getStatus', () => {
    it('should return the measure status', async () => {
      const mockData = { enabled: true };
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: mockData },
        headers: {},
      });

      const api = new MeasureApi(mockConfig, mockHttpClient);
      const result = await api.getStatus();

      expect(result).toEqual(mockData);
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: 'http://localhost:8000/measure/status',
        }),
        'test-read-key'
      );
    });

    it('should report when analytics are disabled', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: { enabled: false } },
        headers: {},
      });

      const api = new MeasureApi(mockConfig, mockHttpClient);
      const result = await api.getStatus();

      expect(result).toEqual({ enabled: false });
    });
  });

  describe('getDashboardSummary', () => {
    it('should return the dashboard summary', async () => {
      const mockData = { total_searches: 100, total_clicks: 50 };
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: mockData },
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
        data: { status: 200, data: {} },
        headers: {},
      });

      const api = new MeasureApi(mockConfig, mockHttpClient);
      await api.getDashboardSummary();

      expect(mockHttpClient.request).toHaveBeenCalledWith(expect.anything(), 'test-read-key');
    });
  });

  describe('trackEvent', () => {
    it('should track a single measure event', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: 'event tracked' },
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
        data: { status: 200, data: 'ok' },
        headers: {},
      });

      const api = new MeasureApi(mockConfig, mockHttpClient);
      await api.trackEvent(sampleEvent);

      expect(mockHttpClient.request).toHaveBeenCalledWith(expect.anything(), 'test-ingest-key');
    });
  });

  describe('trackBatch', () => {
    it('should track a batch of measure events', async () => {
      const events = [sampleEvent, { ...sampleEvent, event_name: 'click' }];
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: 'batch tracked' },
        headers: {},
      });

      const api = new MeasureApi(mockConfig, mockHttpClient);
      const result = await api.trackBatch(events);

      expect(result).toBe('batch tracked');
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: 'http://localhost:8000/measure/batch',
          body: { items: events },
        }),
        'test-ingest-key'
      );
    });

    it('should use the ingest key for trackBatch', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: 'ok' },
        headers: {},
      });

      const api = new MeasureApi(mockConfig, mockHttpClient);
      await api.trackBatch([sampleEvent]);

      expect(mockHttpClient.request).toHaveBeenCalledWith(expect.anything(), 'test-ingest-key');
    });

    it('should track the api_summary_requested event added in engine 0.10.0', async () => {
      const summaryEvent: MeasureRequest = {
        event_name: 'api_summary_requested',
        properties: {
          searchcraft_index_names: ['products'],
          search_term: 'laptop',
          search_kind: 'fuzzy',
          ai_provider: 'anthropic',
          number_of_documents: 5,
        },
        user: {
          user_id: 'user-1',
          user_type: 'anonymous',
        },
      };

      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: 'batch tracked' },
        headers: {},
      });

      const api = new MeasureApi(mockConfig, mockHttpClient);
      await api.trackBatch([summaryEvent]);

      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: 'http://localhost:8000/measure/batch',
          body: { items: [summaryEvent] },
        }),
        'test-ingest-key'
      );
    });
  });

  describe('dashboard reports', () => {
    it('should fetch the conversion report', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: { conversions: 12 } },
        headers: {},
      });

      const api = new MeasureApi(mockConfig, mockHttpClient);
      const result = await api.getDashboardConversion();

      expect(result).toEqual({ conversions: 12 });
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: 'http://localhost:8000/measure/dashboard/conversion',
        }),
        'test-read-key'
      );
    });

    it('should fetch the usage report', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: { searches: 340 } },
        headers: {},
      });

      const api = new MeasureApi(mockConfig, mockHttpClient);
      const result = await api.getDashboardUsage();

      expect(result).toEqual({ searches: 340 });
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: 'http://localhost:8000/measure/dashboard/usage',
        }),
        'test-read-key'
      );
    });
  });

  describe('dashboard filters', () => {
    it('should send no query string when no filters are given', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: {} },
        headers: {},
      });

      const api = new MeasureApi(mockConfig, mockHttpClient);
      await api.getDashboardSummary();

      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'http://localhost:8000/measure/dashboard/summary',
        }),
        'test-read-key'
      );
    });

    it('should serialize filters, pipe-delimiting index_names', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: {} },
        headers: {},
      });

      const api = new MeasureApi(mockConfig, mockHttpClient);
      await api.getDashboardSummary({
        organization_id: 'org-1',
        index_names: ['products', 'articles'],
        date_start: 1700000000,
        date_end: 1700086400,
        granularity: 'days',
      });

      const call = vi.mocked(mockHttpClient.request).mock.calls.at(-1);
      if (!call) throw new Error('expected a request to have been made');
      const url = new URL((call[0] as { path: string }).path);
      expect(url.pathname).toBe('/measure/dashboard/summary');
      expect(url.searchParams.get('organization_id')).toBe('org-1');
      // The engine parses index_names as a pipe-delimited list.
      expect(url.searchParams.get('index_names')).toBe('products|articles');
      expect(url.searchParams.get('date_start')).toBe('1700000000');
      expect(url.searchParams.get('granularity')).toBe('days');
    });

    it('should omit an empty index_names list', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: {} },
        headers: {},
      });

      const api = new MeasureApi(mockConfig, mockHttpClient);
      await api.getDashboardUsage({ index_names: [], page: 0 });

      const call = vi.mocked(mockHttpClient.request).mock.calls.at(-1);
      if (!call) throw new Error('expected a request to have been made');
      const url = new URL((call[0] as { path: string }).path);
      expect(url.searchParams.has('index_names')).toBe(false);
      // page 0 is meaningful and must survive serialization
      expect(url.searchParams.get('page')).toBe('0');
    });
  });
});
