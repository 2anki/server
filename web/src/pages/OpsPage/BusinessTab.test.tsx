import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

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

const buildSampleMetrics = (
  overrides: Partial<BusinessMetricsResponse> = {}
): BusinessMetricsResponse => ({
  mrr_usd: 4820,
  net_new_mrr_mtd_usd: 312,
  active_paying_subs: 184,
  churn_30d_pct: 2.1,
  failed_payments_7d: 4,
  new_paid_conversions_7d: 11,
  mrr_timeseries: Array.from({ length: 90 }).map((_, i) => ({
    t: `2026-02-${String((i % 28) + 1).padStart(2, '0')}`,
    mrr_usd: 1000 + i * 10,
  })),
  active_subs_timeseries: Array.from({ length: 90 }).map((_, i) => ({
    t: `2026-02-${String((i % 28) + 1).padStart(2, '0')}`,
    active_paying_subs: 50 + i,
  })),
  conversions_vs_churn_weekly: Array.from({ length: 12 }).map((_, i) => ({
    week: `2026-02-${String((i % 28) + 1).padStart(2, '0')}`,
    new_paying: 5 + i,
    churned: 1 + (i % 3),
  })),
  failed_payments_weekly: Array.from({ length: 12 }).map((_, i) => ({
    week: `2026-02-${String((i % 28) + 1).padStart(2, '0')}`,
    count: i % 4,
  })),
  cancellation_reasons_top: [
    { reason: 'Too expensive', count: 7 },
    { reason: "I don't use it enough", count: 4 },
    { reason: 'Other', count: 1 },
  ],
  cancellation_comments_recent: [
    {
      reason: 'Other',
      comment: 'I missed Anki shared decks',
      created_at: '2026-05-08T11:00:00.000Z',
    },
  ],
  as_of: '2026-05-09T14:32:07.000Z',
  cache_age_seconds: 412,
  ...overrides,
});

describe('BusinessTab', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  test('renders all six big-number cards from the response', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => buildSampleMetrics(),
    });

    renderTab();

    await waitFor(() => expect(screen.getByText('$4,820')).toBeInTheDocument());
    expect(screen.getByText('MRR')).toBeInTheDocument();
    expect(screen.getByText('$312')).toBeInTheDocument();
    expect(screen.getByText('Net new MRR (MTD)')).toBeInTheDocument();
    expect(screen.getByText('184')).toBeInTheDocument();
    expect(screen.getByText('Active paying subs')).toBeInTheDocument();
    expect(screen.getByText('2.1%')).toBeInTheDocument();
    expect(screen.getByText('Churn (30d)')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Failed payments (7d)')).toBeInTheDocument();
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.getByText('New paid conversions (7d)')).toBeInTheDocument();

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/ops/business/metrics',
      expect.objectContaining({ credentials: 'include' })
    );
  });

  test('renders all chart panel titles', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => buildSampleMetrics(),
    });

    renderTab();

    await waitFor(() =>
      expect(screen.getByText('MRR, last 90 days')).toBeInTheDocument()
    );
    expect(
      screen.getByText('Active paying subs, last 90 days')
    ).toBeInTheDocument();
    expect(
      screen.getByText('New vs churned, last 12 weeks')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Failed payments, last 12 weeks')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Why users cancel, last 90 days')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Recent cancellation comments')
    ).toBeInTheDocument();
  });

  test('shows ChartPanel empty state when time-series arrays are empty', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () =>
        buildSampleMetrics({
          mrr_timeseries: [],
          active_subs_timeseries: [],
          conversions_vs_churn_weekly: [],
          failed_payments_weekly: [],
          cancellation_reasons_top: [],
          cancellation_comments_recent: [],
        }),
    });

    renderTab();

    await waitFor(() =>
      expect(screen.getByText('No MRR history yet.')).toBeInTheDocument()
    );
    expect(screen.getByText('No active-subs history yet.')).toBeInTheDocument();
    expect(
      screen.getByText('No subscription movements yet.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('No failed payments in this window.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('No cancellations recorded yet.')
    ).toBeInTheDocument();
    expect(screen.getByText('No free-text comments yet.')).toBeInTheDocument();
  });

  test('renders cancellation comment text from the response', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => buildSampleMetrics(),
    });

    renderTab();

    await waitFor(() =>
      expect(screen.getByText('I missed Anki shared decks')).toBeInTheDocument()
    );
  });

  test('shows the alert banner when the request fails', async () => {
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
    expect(screen.getByText(/Last good data shown below/i)).toBeInTheDocument();
  });

  test('renders no <pre> JSON dump anywhere', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => buildSampleMetrics(),
    });

    const { container } = renderTab();

    await waitFor(() => expect(screen.getByText('$4,820')).toBeInTheDocument());
    expect(container.querySelector('pre')).toBeNull();
  });
});
