import { APIErrorCode, APIResponseError } from '@notionhq/client';

export interface WithRetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  label?: string;
}

const RETRYABLE_NOTION_CODES = new Set<string>([
  APIErrorCode.RateLimited,
  APIErrorCode.InternalServerError,
  APIErrorCode.ServiceUnavailable,
  'gateway_timeout',
]);

const RETRYABLE_NETWORK_CODES = new Set<string>([
  'ECONNRESET',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'EAI_AGAIN',
  'ENOTFOUND',
  'EPIPE',
  'UND_ERR_SOCKET',
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_HEADERS_TIMEOUT',
]);

function isRetryable(error: unknown): boolean {
  if (error instanceof APIResponseError) {
    return RETRYABLE_NOTION_CODES.has(error.code);
  }
  const code = (error as { code?: string })?.code;
  if (typeof code === 'string' && RETRYABLE_NETWORK_CODES.has(code)) {
    return true;
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: WithRetryOptions = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 500;
  const label = options.label;

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts || !isRetryable(error)) {
        throw error;
      }
      const jitter = 0.5 + Math.random();
      const delay = Math.floor(baseDelayMs * 2 ** (attempt - 1) * jitter);
      const message = (error as { message?: string })?.message ?? 'unknown';
      console.warn(
        `[withRetry${label ? `:${label}` : ''}] attempt ${attempt}/${maxAttempts} failed (${message}); retrying in ${delay}ms`
      );
      await sleep(delay);
    }
  }
  throw lastError;
}
