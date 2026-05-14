import { describe, expect, it, afterEach } from 'vitest';
import { getGaClientId } from './getGaClientId';

describe('getGaClientId', () => {
  afterEach(() => {
    document.cookie = '_ga=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });

  it('returns the _ga cookie value when present', () => {
    document.cookie = '_ga=GA1.1.123456789.1234567890';
    expect(getGaClientId()).toBe('GA1.1.123456789.1234567890');
  });

  it('returns an empty string when _ga cookie is absent', () => {
    expect(getGaClientId()).toBe('');
  });
});
