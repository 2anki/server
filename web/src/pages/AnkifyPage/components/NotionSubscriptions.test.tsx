import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import NotionSubscriptions from './NotionSubscriptions';
import { Backend } from '../../../lib/backend/Backend';

type Subscription = Awaited<ReturnType<Backend['listAnkifySubscriptions']>>[number];
type Schedule = Awaited<ReturnType<Backend['getAnkifyExportSchedule']>>;

const sampleSubscription = (overrides: Partial<Subscription> = {}): Subscription => ({
  id: 1,
  notion_page_id: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  notion_page_title: 'My deck',
  notion_page_url: 'https://notion.so/My-deck',
  notion_page_icon: null,
  enabled: true,
  last_polled_at: null,
  last_synced_at: new Date().toISOString(),
  last_error: null,
  ...overrides,
});

const sampleSchedule = (overrides: Partial<NonNullable<Schedule>> = {}): Schedule => ({
  id: 10,
  owner: 42,
  database_id: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  time_of_day: '09:15',
  timezone: 'UTC',
  date_range_days: null,
  enabled: true,
  last_run_at: null,
  ...overrides,
});

const makeBackend = (overrides: Partial<Backend> = {}): Backend =>
  ({
    listAnkifySubscriptions: vi.fn(async () => []),
    deleteAnkifySubscription: vi.fn(),
    subscribeAnkifyNotionPage: vi.fn(),
    searchTopLevelPages: vi.fn(async () => []),
    ...overrides,
  } as unknown as Backend);

const renderSubs = (
  backend: Backend,
  schedule: Schedule = null,
) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <NotionSubscriptions backend={backend} schedule={schedule} />
    </QueryClientProvider>
  );
};

describe('NotionSubscriptions sync copy', () => {
  test('renders the page-level helper exactly once above the deck list', async () => {
    const backend = makeBackend({
      listAnkifySubscriptions: vi.fn(async () => [
        sampleSubscription({ id: 1, notion_page_id: 'a'.repeat(32) }),
        sampleSubscription({ id: 2, notion_page_id: 'b'.repeat(32) }),
        sampleSubscription({ id: 3, notion_page_id: 'c'.repeat(32) }),
      ]),
    });

    renderSubs(backend);

    await waitFor(() => {
      const matches = screen.getAllByText(/checks notion for changes every 5 minutes\./i);
      expect(matches).toHaveLength(1);
    });
  });

  test('does not render the helper when there are no decks', async () => {
    const backend = makeBackend({
      listAnkifySubscriptions: vi.fn(async () => []),
    });

    renderSubs(backend);

    await waitFor(() =>
      expect(
        screen.getByLabelText(/search your notion pages/i)
      ).toBeInTheDocument()
    );
    expect(
      screen.queryByText(/checks notion for changes every 5 minutes\./i)
    ).not.toBeInTheDocument();
  });

  test('renders no second line when last_error is null and no schedule matches', async () => {
    const backend = makeBackend({
      listAnkifySubscriptions: vi.fn(async () => [
        sampleSubscription({
          id: 1,
          notion_page_id: 'a'.repeat(32),
          last_error: null,
        }),
      ]),
    });

    renderSubs(backend);

    await waitFor(() =>
      expect(screen.getByText('My deck')).toBeInTheDocument()
    );
    expect(
      screen.queryByText(/last check failed/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/next export at/i)
    ).not.toBeInTheDocument();
  });

  test('renders the error line when last_error is set', async () => {
    const backend = makeBackend({
      listAnkifySubscriptions: vi.fn(async () => [
        sampleSubscription({
          id: 1,
          notion_page_id: 'a'.repeat(32),
          last_error: 'boom',
        }),
      ]),
    });

    renderSubs(backend);

    await waitFor(() =>
      expect(
        screen.getByText(/last check failed — we'll try again soon/i)
      ).toBeInTheDocument()
    );
  });

  test('renders next-export line when schedule matches and is enabled', async () => {
    const matchingId = 'a'.repeat(32);
    const backend = makeBackend({
      listAnkifySubscriptions: vi.fn(async () => [
        sampleSubscription({
          id: 1,
          notion_page_id: matchingId,
          last_error: null,
        }),
      ]),
    });

    renderSubs(
      backend,
      sampleSchedule({ database_id: matchingId, time_of_day: '09:15', enabled: true })
    );

    await waitFor(() =>
      expect(screen.getByText(/^next export at /i)).toBeInTheDocument()
    );
  });

  test('does not render next-export line when schedule is disabled', async () => {
    const matchingId = 'a'.repeat(32);
    const backend = makeBackend({
      listAnkifySubscriptions: vi.fn(async () => [
        sampleSubscription({
          id: 1,
          notion_page_id: matchingId,
          last_error: null,
        }),
      ]),
    });

    renderSubs(
      backend,
      sampleSchedule({ database_id: matchingId, enabled: false })
    );

    await waitFor(() =>
      expect(screen.getByText('My deck')).toBeInTheDocument()
    );
    expect(screen.queryByText(/next export at/i)).not.toBeInTheDocument();
  });

  test('does not render next-export line when schedule database_id does not match', async () => {
    const backend = makeBackend({
      listAnkifySubscriptions: vi.fn(async () => [
        sampleSubscription({
          id: 1,
          notion_page_id: 'a'.repeat(32),
          last_error: null,
        }),
      ]),
    });

    renderSubs(
      backend,
      sampleSchedule({ database_id: 'b'.repeat(32), enabled: true })
    );

    await waitFor(() =>
      expect(screen.getByText('My deck')).toBeInTheDocument()
    );
    expect(screen.queryByText(/next export at/i)).not.toBeInTheDocument();
  });

  test('renders the page icon next to the title when present', async () => {
    const backend = makeBackend({
      listAnkifySubscriptions: vi.fn(async () => [
        sampleSubscription({
          id: 1,
          notion_page_id: 'a'.repeat(32),
          notion_page_icon: '📘',
        }),
      ]),
    });

    renderSubs(backend);

    await waitFor(() =>
      expect(screen.getByText('My deck')).toBeInTheDocument()
    );
    expect(screen.getByText('📘')).toBeInTheDocument();
  });

  test('renders an image icon when notion_page_icon is a URL', async () => {
    const backend = makeBackend({
      listAnkifySubscriptions: vi.fn(async () => [
        sampleSubscription({
          id: 1,
          notion_page_id: 'a'.repeat(32),
          notion_page_icon: 'https://example.com/icon.png',
        }),
      ]),
    });

    renderSubs(backend);

    await waitFor(() =>
      expect(screen.getByText('My deck')).toBeInTheDocument()
    );
    const img = screen.getByAltText('icon') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toBe('https://example.com/icon.png');
  });

  test('error line takes precedence over next-export line', async () => {
    const matchingId = 'a'.repeat(32);
    const backend = makeBackend({
      listAnkifySubscriptions: vi.fn(async () => [
        sampleSubscription({
          id: 1,
          notion_page_id: matchingId,
          last_error: 'boom',
        }),
      ]),
    });

    renderSubs(
      backend,
      sampleSchedule({ database_id: matchingId, enabled: true })
    );

    await waitFor(() =>
      expect(
        screen.getByText(/last check failed — we'll try again soon/i)
      ).toBeInTheDocument()
    );
    expect(screen.queryByText(/next export at/i)).not.toBeInTheDocument();
  });
});
