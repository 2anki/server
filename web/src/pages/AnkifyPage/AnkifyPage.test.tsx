import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AnkifyPage from './AnkifyPage';
import AnkifyClient from '../../lib/interfaces/AnkifyClient';
import { Backend } from '../../lib/backend/Backend';

const renderWithClient = (backend: Backend) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AnkifyPage backend={backend} />
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
    ...overrides,
  } as unknown as Backend);

describe('AnkifyPage', () => {
  test('renders the lead copy when no clients exist', async () => {
    renderWithClient(makeBackend());

    await waitFor(() =>
      expect(
        screen.getByText(/two quick steps and you're set/i)
      ).toBeInTheDocument()
    );
  });

  test('renders the active client and ignores inactive ones', async () => {
    const backend = makeBackend({
      listAnkifyClients: vi.fn(async () => [
        sampleClient(),
        sampleClient({ id: 2, container_name: 'sleepy_swan', status: 'inactive' }),
      ]),
    });

    renderWithClient(backend);

    await waitFor(() =>
      expect(
        screen.queryByText(/two quick steps and you're set/i)
      ).not.toBeInTheDocument()
    );
    expect(screen.queryByText('happy_hopper')).not.toBeInTheDocument();
    expect(screen.queryByText('sleepy_swan')).not.toBeInTheDocument();
  });

  test('shows the provision button and triggers the backend on click', async () => {
    const provision = vi.fn(async () => sampleClient());
    const backend = makeBackend({
      provisionAnkifyClient: provision,
    });

    renderWithClient(backend);

    const button = await screen.findByRole('button', {
      name: /start anki/i,
    });
    button.click();

    await waitFor(() => expect(provision).toHaveBeenCalledTimes(1));
  });

  test('does not render inactive clients at all', async () => {
    const backend = makeBackend({
      listAnkifyClients: vi.fn(async () => [
        sampleClient({ status: 'inactive' }),
      ]),
    });

    renderWithClient(backend);

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /start anki/i })
      ).toBeInTheDocument()
    );
    expect(screen.queryByText('happy_hopper')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /shut down/i })
    ).not.toBeInTheDocument();
  });
});
