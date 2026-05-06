import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cancelSubscription } from './cancelSubscription';
import * as api from './api';

vi.mock('./api', () => ({
  post: vi.fn(),
}));

const createMockResponse = (
  status: number,
  jsonData: unknown,
  statusText = ''
): Response =>
  ({
    status,
    statusText,
    json: vi.fn().mockResolvedValue(jsonData),
  }) as unknown as Response;

describe('cancelSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the success payload on 200', async () => {
    vi.mocked(api.post).mockResolvedValue(
      createMockResponse(200, { message: 'scheduled' })
    );

    await expect(cancelSubscription()).resolves.toEqual({
      message: 'scheduled',
    });
  });

  it('defaults mode to period_end when called without args', async () => {
    vi.mocked(api.post).mockResolvedValue(
      createMockResponse(200, { message: 'ok' })
    );

    await cancelSubscription();

    expect(api.post).toHaveBeenCalledWith(
      '/api/users/cancel-subscription',
      { mode: 'period_end' }
    );
  });

  it('sends the requested mode in the body', async () => {
    vi.mocked(api.post).mockResolvedValue(
      createMockResponse(200, { message: 'ok' })
    );

    await cancelSubscription('immediate');

    expect(api.post).toHaveBeenCalledWith(
      '/api/users/cancel-subscription',
      { mode: 'immediate' }
    );
  });

  it('throws the server message from a JSON error body', async () => {
    vi.mocked(api.post).mockResolvedValue(
      createMockResponse(
        404,
        { message: 'No active subscription found' },
        'Not Found'
      )
    );

    await expect(cancelSubscription()).rejects.toThrow(
      'No active subscription found'
    );
  });

  it('falls back to statusText when no JSON message is present', async () => {
    vi.mocked(api.post).mockResolvedValue(
      createMockResponse(500, {}, 'Internal Server Error')
    );

    await expect(cancelSubscription()).rejects.toThrow(
      'Internal Server Error'
    );
  });
});
