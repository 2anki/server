import { APIErrorCode, APIResponseError } from '@notionhq/client';
import { withRetry } from './withRetry';

function makeApiError(code: APIErrorCode, status = 500): APIResponseError {
  const err = new Error('api') as any;
  Object.setPrototypeOf(err, APIResponseError.prototype);
  err.code = code;
  err.status = status;
  err.name = 'APIResponseError';
  return err as APIResponseError;
}

describe('withRetry', () => {
  it('returns the result when the operation succeeds on the first try', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const result = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 1 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on rate_limited and eventually succeeds', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(makeApiError(APIErrorCode.RateLimited, 429))
      .mockResolvedValueOnce('ok');
    const result = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 1 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('retries on internal_server_error', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(makeApiError(APIErrorCode.InternalServerError, 500))
      .mockResolvedValueOnce('ok');
    await withRetry(fn, { maxAttempts: 3, baseDelayMs: 1 });
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('retries on network errors (no response)', async () => {
    const networkError: any = new Error('ECONNRESET');
    networkError.code = 'ECONNRESET';
    const fn = jest
      .fn()
      .mockRejectedValueOnce(networkError)
      .mockResolvedValueOnce('ok');
    await withRetry(fn, { maxAttempts: 3, baseDelayMs: 1 });
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does NOT retry on unauthorized', async () => {
    const err = makeApiError(APIErrorCode.Unauthorized, 401);
    const fn = jest.fn().mockRejectedValue(err);
    await expect(
      withRetry(fn, { maxAttempts: 3, baseDelayMs: 1 })
    ).rejects.toBe(err);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does NOT retry on object_not_found', async () => {
    const err = makeApiError(APIErrorCode.ObjectNotFound, 404);
    const fn = jest.fn().mockRejectedValue(err);
    await expect(
      withRetry(fn, { maxAttempts: 3, baseDelayMs: 1 })
    ).rejects.toBe(err);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does NOT retry on validation_error', async () => {
    const err = makeApiError(APIErrorCode.ValidationError, 400);
    const fn = jest.fn().mockRejectedValue(err);
    await expect(
      withRetry(fn, { maxAttempts: 3, baseDelayMs: 1 })
    ).rejects.toBe(err);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('gives up after maxAttempts retryable failures and throws the last error', async () => {
    const err = makeApiError(APIErrorCode.InternalServerError, 500);
    const fn = jest.fn().mockRejectedValue(err);
    await expect(
      withRetry(fn, { maxAttempts: 3, baseDelayMs: 1 })
    ).rejects.toBe(err);
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
