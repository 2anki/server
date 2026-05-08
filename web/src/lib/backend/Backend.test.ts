import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Backend } from './Backend';
import * as api from './api';
import { JobsId } from '../../schemas/public/Jobs';

// Mock the api module
vi.mock('./api', () => ({
  del: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
}));

// Helper function to create a mock Response
const createMockResponse = (
  status: number,
  ok: boolean,
  statusText = '',
  jsonData?: any
): Response => {
  const response = {
    ok,
    status,
    statusText,
    headers: new Headers(),
    redirected: false,
    type: 'basic' as ResponseType,
    url: '',
    body: null,
    bodyUsed: false,
    clone: vi.fn(),
    arrayBuffer: vi.fn(),
    blob: vi.fn(),
    formData: vi.fn(),
    json: vi.fn().mockResolvedValue(jsonData || {}),
    text: vi.fn(),
  } as unknown as Response;

  if (jsonData && status === 409) {
    (response as any).json = vi.fn().mockResolvedValue(jsonData);
  }

  return response;
};

describe('Backend', () => {
  let backend: Backend;

  beforeEach(() => {
    backend = new Backend();
    vi.clearAllMocks();
  });

  describe('deleteJob', () => {
    it('should handle successful job deletion', async () => {
      const mockResponse = createMockResponse(200, true);
      vi.mocked(api.del).mockResolvedValue(mockResponse);

      await expect(backend.deleteJob(123 as JobsId)).resolves.toBeUndefined();
      expect(api.del).toHaveBeenCalledWith('/api/upload/jobs/123');
    });

    it('should handle 409 Conflict with custom message', async () => {
      const mockResponse = createMockResponse(409, false, 'Conflict', {
        message: 'Job is currently running and cannot be deleted',
      });
      vi.mocked(api.del).mockResolvedValue(mockResponse);

      await expect(backend.deleteJob(123 as JobsId)).rejects.toThrow(
        'Job is currently running and cannot be deleted'
      );
    });

    it('should handle 409 Conflict with default message', async () => {
      const mockResponse = createMockResponse(409, false, 'Conflict');
      (mockResponse as any).json = vi.fn().mockRejectedValue(new Error('Invalid JSON'));
      vi.mocked(api.del).mockResolvedValue(mockResponse);

      await expect(backend.deleteJob(123 as JobsId)).rejects.toThrow(
        'Cannot delete job while it is in progress'
      );
    });

    it('should handle other HTTP errors', async () => {
      const mockResponse = createMockResponse(500, false, 'Internal Server Error');
      vi.mocked(api.del).mockResolvedValue(mockResponse);

      await expect(backend.deleteJob(123 as JobsId)).rejects.toThrow(
        'Failed to delete job: 500 Internal Server Error'
      );
    });

    it('should handle null response', async () => {
      vi.mocked(api.del).mockResolvedValue(null);

      await expect(backend.deleteJob(123 as JobsId)).resolves.toBeUndefined();
    });
  });

  describe('search', () => {
    beforeEach(() => {
      vi.mocked(api.get).mockResolvedValue(
        createMockResponse(200, true, '', { results: [] })
      );
    });

    it('drops entries with empty titles and exposes parent on the rest', async () => {
      vi.mocked(api.post).mockResolvedValue(
        createMockResponse(200, true, '', {
          results: [
            {
              id: 'page-named',
              object: 'page',
              url: 'https://www.notion.so/page-named',
              parent: { type: 'page_id', page_id: 'parent-1' },
              properties: {
                title: {
                  id: 'title',
                  type: 'title',
                  title: [{ plain_text: 'Real page' }],
                },
              },
            },
            {
              id: 'page-untitled',
              object: 'page',
              url: 'https://www.notion.so/page-untitled',
              parent: { type: 'page_id', page_id: 'parent-1' },
              properties: {
                title: { id: 'title', type: 'title', title: [] },
              },
            },
            {
              id: 'db-row',
              object: 'page',
              url: 'https://www.notion.so/db-row',
              parent: { type: 'database_id', database_id: 'db-1' },
              properties: {
                Name: {
                  id: 'name',
                  type: 'title',
                  title: [{ plain_text: 'Card 1' }],
                },
              },
            },
          ],
        })
      );

      const results = await backend.search('anything');

      expect(results.map((r) => r.id)).toEqual(['page-named', 'db-row']);
      expect(results[0].parent).toEqual({ type: 'page_id' });
      expect(results[1].parent).toEqual({ type: 'database_id' });
    });
  });

  describe('restartClaudeJob', () => {
    it('should call post with the correct URL and empty payload', async () => {
      const mockResponse = createMockResponse(202, true);
      vi.mocked(api.post).mockResolvedValue(mockResponse);

      await backend.restartClaudeJob('abc-123');

      expect(api.post).toHaveBeenCalledWith(
        expect.stringContaining('upload/jobs/abc-123/restart'),
        {}
      );
    });
  });
});