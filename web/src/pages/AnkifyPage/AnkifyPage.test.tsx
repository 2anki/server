import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import AnkifyPage from './AnkifyPage';
import AnkifySetupPage from './AnkifySetupPage';
import AnkifyClient from '../../lib/interfaces/AnkifyClient';
import { Backend } from '../../lib/backend/Backend';

const ANKI_WEB_ACK_KEY = 'ankify_anki_web_acknowledged';

const renderAt = (path: string, backend: Backend) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/ankify" element={<AnkifyPage backend={backend} />} />
          <Route
            path="/ankify/setup"
            element={<AnkifySetupPage backend={backend} />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

const sampleClient = (overrides: Partial<AnkifyClient> = {}): AnkifyClient => ({
  id: 1,
  owner: 42,
  container_id: 'container-abc',
  container_name: 'happy_hopper',
  anki_port: 20000,
  vnc_port: 21000,
  novnc_port: 22000,
  status: 'active',
  created_at: null,
  last_active_at: null,
  ...overrides,
});

const makeBackend = (overrides: Partial<Backend> = {}): Backend =>
  ({
    listAnkifyClients: vi.fn(async () => []),
    provisionAnkifyClient: vi.fn(),
    stopAnkifyClient: vi.fn(),
    respinAnkifyClient: vi.fn(),
    reissueAnkifySessionUrl: vi.fn(),
    listAnkifySubscriptions: vi.fn(async () => []),
    listAnkifyConflicts: vi.fn(async () => []),
    getAnkifyExportSchedule: vi.fn(async () => null),
    checkAnkifyActiveClientReady: vi.fn(async () => ({ ready: false })),
    checkAnkifyAnkiWebStatus: vi.fn(async () => ({
      status: 'unlinked' as const,
    })),
    ...overrides,
  } as unknown as Backend);

describe('AnkifySetupPage', () => {
  beforeEach(() => {
    globalThis.localStorage?.removeItem(ANKI_WEB_ACK_KEY);
  });

  test('shows the heading copy on first run', async () => {
    renderAt('/ankify/setup', makeBackend());

    await waitFor(() =>
      expect(
        screen.getByText(/set up anki in your browser/i)
      ).toBeInTheDocument()
    );
  });

  test('shows the start button when no active client', async () => {
    const provision = vi.fn(async () => sampleClient());
    const backend = makeBackend({ provisionAnkifyClient: provision });

    renderAt('/ankify/setup', backend);

    const button = await screen.findByRole('button', { name: /start anki/i });
    button.click();

    await waitFor(() => expect(provision).toHaveBeenCalledTimes(1));
  });

  test('does not render the Beta badge anywhere', async () => {
    renderAt('/ankify/setup', makeBackend());
    await waitFor(() =>
      expect(
        screen.getByText(/set up anki in your browser/i)
      ).toBeInTheDocument()
    );
    expect(screen.queryByText(/beta/i)).not.toBeInTheDocument();
  });

  test('Step 2 offers a Restart Anki action that respins the client', async () => {
    const respin = vi.fn(async () => sampleClient({ id: 99 }));
    const backend = makeBackend({
      listAnkifyClients: vi.fn(async () => [sampleClient()]),
      checkAnkifyActiveClientReady: vi.fn(async () => ({ ready: true })),
      checkAnkifyAnkiWebStatus: vi.fn(async () => ({
        status: 'unlinked' as const,
      })),
      respinAnkifyClient: respin,
    });

    renderAt('/ankify/setup', backend);

    const restart = await screen.findByRole('button', {
      name: /restart anki/i,
    });
    restart.click();
    await waitFor(() => expect(respin).toHaveBeenCalledTimes(1));
  });

  test('shows a timeout fallback once Anki has been starting too long', async () => {
    const stale = sampleClient({
      created_at: new Date(Date.now() - 60_000).toISOString(),
    });
    const respin = vi.fn(async () => sampleClient({ id: 2 }));
    const backend = makeBackend({
      listAnkifyClients: vi.fn(async () => [stale]),
      checkAnkifyActiveClientReady: vi.fn(async () => ({
        ready: false,
        reason: 'unreachable' as const,
      })),
      respinAnkifyClient: respin,
    });

    renderAt('/ankify/setup', backend);

    const tryAgain = await screen.findByRole('button', { name: /try again/i });
    expect(
      screen.getByText(/anki is taking longer than expected/i)
    ).toBeInTheDocument();

    tryAgain.click();
    await waitFor(() => expect(respin).toHaveBeenCalledTimes(1));
  });
});

const ANKIFY_WELCOME_KEY = 'ankify_welcome_seen';

describe('AnkifyPage workspace home', () => {
  beforeEach(() => {
    globalThis.localStorage?.setItem(ANKI_WEB_ACK_KEY, 'true');
    globalThis.localStorage?.removeItem(ANKIFY_WELCOME_KEY);
  });

  afterEach(() => {
    globalThis.localStorage?.removeItem(ANKI_WEB_ACK_KEY);
    globalThis.localStorage?.removeItem(ANKIFY_WELCOME_KEY);
  });

  test('renders the Ankify title and Decks heading when setup is complete', async () => {
    const backend = makeBackend({
      listAnkifyClients: vi.fn(async () => [sampleClient()]),
      checkAnkifyActiveClientReady: vi.fn(async () => ({ ready: true })),
      checkAnkifyAnkiWebStatus: vi.fn(async () => ({
        status: 'linked' as const,
      })),
    });

    renderAt('/ankify', backend);

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: /^ankify$/i, level: 1 })
      ).toBeInTheDocument()
    );
    expect(
      screen.getByRole('tab', { name: /decks/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /find pages/i })
    ).toBeInTheDocument();
  });

  test('does not render the Beta badge', async () => {
    const backend = makeBackend({
      listAnkifyClients: vi.fn(async () => [sampleClient()]),
      checkAnkifyActiveClientReady: vi.fn(async () => ({ ready: true })),
      checkAnkifyAnkiWebStatus: vi.fn(async () => ({
        status: 'linked' as const,
      })),
    });

    renderAt('/ankify', backend);

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: /^ankify$/i, level: 1 })
      ).toBeInTheDocument()
    );
    expect(screen.queryByText(/^beta$/i)).not.toBeInTheDocument();
  });

  test('shows the welcome banner once on first arrival and remembers dismissal', async () => {
    const backend = makeBackend({
      listAnkifyClients: vi.fn(async () => [sampleClient()]),
      checkAnkifyActiveClientReady: vi.fn(async () => ({ ready: true })),
      checkAnkifyAnkiWebStatus: vi.fn(async () => ({
        status: 'linked' as const,
      })),
    });

    const { unmount } = renderAt('/ankify', backend);

    await waitFor(() =>
      expect(
        screen.getByText(/you're synced/i)
      ).toBeInTheDocument()
    );
    expect(
      screen.getByText(/ankify basic and ankify cloze/i)
    ).toBeInTheDocument();

    const dismiss = screen.getByRole('button', { name: /got it/i });
    dismiss.click();

    await waitFor(() =>
      expect(
        screen.queryByText(/you're synced/i)
      ).not.toBeInTheDocument()
    );

    unmount();
    renderAt('/ankify', backend);

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: /^ankify$/i, level: 1 })
      ).toBeInTheDocument()
    );
    expect(screen.queryByText(/you're synced/i)).not.toBeInTheDocument();
  });

  test('does not show the welcome banner once it has been seen', async () => {
    globalThis.localStorage?.setItem(ANKIFY_WELCOME_KEY, 'true');
    const backend = makeBackend({
      listAnkifyClients: vi.fn(async () => [sampleClient()]),
      checkAnkifyActiveClientReady: vi.fn(async () => ({ ready: true })),
      checkAnkifyAnkiWebStatus: vi.fn(async () => ({
        status: 'linked' as const,
      })),
    });

    renderAt('/ankify', backend);

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: /^ankify$/i, level: 1 })
      ).toBeInTheDocument()
    );
    expect(screen.queryByText(/you're synced/i)).not.toBeInTheDocument();
  });
});

const SESSION_URL_PREFIX = 'ankify_session_url:';

describe('Ankify session URL — transparent recovery', () => {
  beforeEach(() => {
    globalThis.localStorage?.setItem(ANKI_WEB_ACK_KEY, 'true');
    globalThis.localStorage?.removeItem(`${SESSION_URL_PREFIX}1`);
  });

  afterEach(() => {
    globalThis.localStorage?.removeItem(ANKI_WEB_ACK_KEY);
    globalThis.localStorage?.removeItem(`${SESSION_URL_PREFIX}1`);
  });

  const makeStatefulBackend = (initialHasActive: boolean) => {
    const state = { hasActive: initialHasActive };
    const reissue = vi.fn(async (id: number) => {
      state.hasActive = true;
      return {
        ...sampleClient({ id }),
        session_url: `https://2anki.net/v/FRESH/vnc.html`,
        has_active_session: true,
      };
    });
    const list = vi.fn(async () => [
      sampleClient({ has_active_session: state.hasActive }),
    ]);
    const backend = makeBackend({
      listAnkifyClients: list,
      checkAnkifyActiveClientReady: vi.fn(async () => ({ ready: true })),
      checkAnkifyAnkiWebStatus: vi.fn(async () => ({
        status: 'linked' as const,
      })),
      reissueAnkifySessionUrl: reissue,
    });
    return { backend, reissue, list };
  };

  test('auto-mints a session URL on mount when none is cached and the container is ready', async () => {
    const { backend, reissue } = makeStatefulBackend(false);

    renderAt('/ankify', backend);

    await waitFor(() => expect(reissue).toHaveBeenCalledWith(1));
    await waitFor(() =>
      expect(
        globalThis.localStorage?.getItem(`${SESSION_URL_PREFIX}1`)
      ).toBe('https://2anki.net/v/FRESH/vnc.html')
    );
  });

  test('clears a stale cached URL when the server reports has_active_session=false', async () => {
    globalThis.localStorage?.setItem(
      `${SESSION_URL_PREFIX}1`,
      'https://2anki.net/v/STALE/vnc.html'
    );
    const { backend, reissue } = makeStatefulBackend(false);

    renderAt('/ankify', backend);

    await waitFor(() => expect(reissue).toHaveBeenCalled());
    await waitFor(() =>
      expect(
        globalThis.localStorage?.getItem(`${SESSION_URL_PREFIX}1`)
      ).toBe('https://2anki.net/v/FRESH/vnc.html')
    );
  });

  test('honours ?session_expired=1 by clearing the cache and re-minting', async () => {
    globalThis.localStorage?.setItem(
      `${SESSION_URL_PREFIX}1`,
      'https://2anki.net/v/STALE/vnc.html'
    );
    const { backend, reissue } = makeStatefulBackend(true);

    renderAt('/ankify?session_expired=1&reason=invalid_session_token', backend);

    await waitFor(() => expect(reissue).toHaveBeenCalledWith(1));
    await waitFor(() =>
      expect(
        globalThis.localStorage?.getItem(`${SESSION_URL_PREFIX}1`)
      ).toBe('https://2anki.net/v/FRESH/vnc.html')
    );
  });

  test('does not show "Get a new link" anywhere in the workspace bar', async () => {
    const backend = makeBackend({
      listAnkifyClients: vi.fn(async () => [
        sampleClient({ has_active_session: true }),
      ]),
      checkAnkifyActiveClientReady: vi.fn(async () => ({ ready: true })),
      checkAnkifyAnkiWebStatus: vi.fn(async () => ({
        status: 'linked' as const,
      })),
    });
    globalThis.localStorage?.setItem(
      `${SESSION_URL_PREFIX}1`,
      'https://2anki.net/v/CACHED/vnc.html'
    );

    renderAt('/ankify', backend);

    await waitFor(() =>
      expect(
        screen.getByRole('link', { name: /open anki/i })
      ).toBeInTheDocument()
    );
    expect(
      screen.queryByRole('button', { name: /get a new link/i })
    ).not.toBeInTheDocument();
  });
});
