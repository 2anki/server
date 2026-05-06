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