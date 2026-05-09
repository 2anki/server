import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

import BusinessTab from './BusinessTab';
import { BusinessMetricsResponse } from './businessTypes';

const renderTab = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <BusinessTab />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

const sampleMetrics: BusinessMetricsResponse = {
  mrr_usd: 4820,
  net_new_mrr_mtd_usd: 312,
  active_paying_subs: 184,
  churn_30d_pct: 2.1,
  failed_payments_7d: 4,
  new_paid_conversions_7d: 11,
  as_of: '2026-05-09T14:32:07.000Z',
  cache_age_seconds: 412,
};

describe('BusinessTab', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  test('fetches /api/ops/business/metrics and renders the JSON shape', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => sampleMetrics,
    });

    renderTab();

    await waitFor(() =>
      expect(screen.getByTestId('business-metrics-json')).toBeInTheDocument()
    );

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/ops/business/metrics',
      expect.objectContaining({ credentials: 'include' })
    );

    const dump = screen.getByTestId('business-metrics-json').textContent ?? '';
    const parsed = JSON.parse(dump);
    expect(parsed.mrr_usd).toBe(4820);
    expect(parsed.active_paying_subs).toBe(184);
    expect(parsed.churn_30d_pct).toBe(2.1);
  });

  test('shows an error banner when the fetch fails', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({}),
    });

    renderTab();

    await waitFor(() =>
      expect(
        screen.getByText(/\/api\/ops\/business\/metrics failed/i)
      ).toBeInTheDocument()
    );
  });
});
