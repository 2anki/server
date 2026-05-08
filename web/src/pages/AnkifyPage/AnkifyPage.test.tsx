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
});

describe('AnkifyPage workspace home', () => {
  beforeEach(() => {
    globalThis.localStorage?.setItem(ANKI_WEB_ACK_KEY, 'true');
  });

  afterEach(() => {
    globalThis.localStorage?.removeItem(ANKI_WEB_ACK_KEY);
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
});
