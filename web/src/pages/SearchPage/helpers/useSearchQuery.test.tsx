import { renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import useSearchQuery, { QUERY_KEY } from './useSearchQuery';
import type Backend from '../../../lib/backend';

const mockBackend = {
  search: vi.fn(),
} as unknown as Backend;

const mockSetError = vi.fn();

describe('useSearchQuery ?q= mount behaviour', () => {
  beforeEach(() => {
    mockBackend.search = vi.fn().mockResolvedValue([]);
    mockSetError.mockClear();
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  it('seeds searchQuery from ?q= when present in the URL on mount', () => {
    vi.stubGlobal('location', {
      search: `?${QUERY_KEY}=Organic%20Chemistry`,
    });

    const { result } = renderHook(() =>
      useSearchQuery(mockBackend, mockSetError)
    );

    expect(result.current.searchQuery).toBe('Organic Chemistry');
  });

  it('falls back to sessionStorage when ?q= is absent', () => {
    vi.stubGlobal('location', { search: '' });
    sessionStorage.setItem('search-query', 'Pharmacology');

    const { result } = renderHook(() =>
      useSearchQuery(mockBackend, mockSetError)
    );

    expect(result.current.searchQuery).toBe('Pharmacology');
  });

  it('falls back to "anki" when both ?q= and sessionStorage are absent', () => {
    vi.stubGlobal('location', { search: '' });

    const { result } = renderHook(() =>
      useSearchQuery(mockBackend, mockSetError)
    );

    expect(result.current.searchQuery).toBe('anki');
  });
});
