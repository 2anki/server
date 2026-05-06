import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import sharedStyles from '../../styles/shared.module.css';
import { get2ankiApi } from '../../lib/backend/get2ankiApi';
import AnkifyClient from '../../lib/interfaces/AnkifyClient';
import { Backend } from '../../lib/backend/Backend';

const QUERY_KEY = ['ankify-clients'];

interface AnkifyPageProps {
  backend?: Backend;
}

export default function AnkifyPage({ backend }: Readonly<AnkifyPageProps>) {
  const api = backend ?? get2ankiApi();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<AnkifyClient[]>({
    queryKey: QUERY_KEY,
    queryFn: () => api.listAnkifyClients(),
  });

  const provision = useMutation({
    mutationFn: () => api.provisionAnkifyClient(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const stop = useMutation({
    mutationFn: (id: number) => api.stopAnkifyClient(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const clients = data ?? [];

  return (
    <main className={sharedStyles.page}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 className={sharedStyles.title}>Ankify (beta)</h1>
        <p className={sharedStyles.subtitle}>
          Provision a hosted Anki client and access it through your browser. This
          surface is allowlisted — only specific accounts can use it.
        </p>
      </header>

      <section style={{ marginBottom: '2rem' }}>
        <button
          type="button"
          className={sharedStyles.btnPrimary}
          onClick={() => provision.mutate()}
          disabled={provision.isPending}
        >
          {provision.isPending ? 'Provisioning…' : 'Provision new client'}
        </button>
        {provision.error && (
          <p role="alert" style={{ color: '#c0392b', marginTop: '0.75rem' }}>
            {(provision.error as Error).message}
          </p>
        )}
      </section>

      {isLoading && <p>Loading clients…</p>}

      {error && (
        <p role="alert" style={{ color: '#c0392b' }}>
          Failed to load clients: {(error as Error).message}
        </p>
      )}

      {!isLoading && !error && clients.length === 0 && (
        <p>No clients yet. Provision one to get started.</p>
      )}

      {clients.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th align="left">ID</th>
              <th align="left">Status</th>
              <th align="left">noVNC</th>
              <th align="left">AnkiConnect</th>
              <th align="left">Container</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => {
              const novncUrl = `http://${globalThis.location.hostname}:${client.novnc_port}/vnc.html`;
              return (
                <tr key={client.id}>
                  <td>{client.id}</td>
                  <td>{client.status}</td>
                  <td>
                    {client.status === 'active' ? (
                      <a href={novncUrl} target="_blank" rel="noreferrer">
                        Open :{client.novnc_port}
                      </a>
                    ) : (
                      <span>:{client.novnc_port}</span>
                    )}
                  </td>
                  <td>:{client.anki_port}</td>
                  <td title={client.container_id} style={{ fontFamily: 'monospace' }}>
                    {client.container_name ?? client.container_id.slice(0, 12)}
                  </td>
                  <td>
                    {client.status === 'active' && (
                      <button
                        type="button"
                        className={sharedStyles.btnDanger}
                        onClick={() => stop.mutate(client.id)}
                        disabled={stop.isPending}
                      >
                        Stop
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}
