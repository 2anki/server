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
  test('renders the empty state when no clients exist', async () => {
    renderWithClient(makeBackend());

    await waitFor(() =>
      expect(
        screen.getByText(/no clients yet/i, { exact: false })
      ).toBeInTheDocument()
    );
  });

  test('renders a row per client returned by the backend', async () => {
    const backend = makeBackend({
      listAnkifyClients: vi.fn(async () => [
        sampleClient(),
        sampleClient({ id: 2, container_name: 'sleepy_swan' }),
      ]),
    });

    renderWithClient(backend);

    await waitFor(() =>
      expect(screen.getByText('happy_hopper')).toBeInTheDocument()
    );
    expect(screen.getByText('sleepy_swan')).toBeInTheDocument();
  });

  test('shows the provision button and triggers the backend on click', async () => {
    const provision = vi.fn(async () => sampleClient());
    const backend = makeBackend({
      provisionAnkifyClient: provision,
    });

    renderWithClient(backend);

    const button = await screen.findByRole('button', {
      name: /provision new client/i,
    });
    button.click();

    await waitFor(() => expect(provision).toHaveBeenCalledTimes(1));
  });

  test('disables the Provision button when an active client already exists', async () => {
    const backend = makeBackend({
      listAnkifyClients: vi.fn(async () => [sampleClient()]),
    });

    renderWithClient(backend);

    const button = await screen.findByRole('button', {
      name: /already provisioned/i,
    });
    expect(button).toBeDisabled();
  });

  test('hides the Stop button for inactive clients', async () => {
    const backend = makeBackend({
      listAnkifyClients: vi.fn(async () => [
        sampleClient({ status: 'inactive' }),
      ]),
    });

    renderWithClient(backend);

    await waitFor(() =>
      expect(screen.getByText('happy_hopper')).toBeInTheDocument()
    );
    expect(
      screen.queryByRole('button', { name: /stop/i })
    ).not.toBeInTheDocument();
  });
});
