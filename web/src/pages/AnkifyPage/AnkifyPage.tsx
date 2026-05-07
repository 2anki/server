import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import sharedStyles from '../../styles/shared.module.css';
import styles from './AnkifyPage.module.css';
import { get2ankiApi } from '../../lib/backend/get2ankiApi';
import AnkifyClient from '../../lib/interfaces/AnkifyClient';
import { Backend } from '../../lib/backend/Backend';
import ReviewDataExport from './components/ReviewDataExport';
import NotionSubscriptions from './components/NotionSubscriptions';
import SyncConflicts from './components/SyncConflicts';

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

  const respin = useMutation({
    mutationFn: () => api.respinAnkifyClient(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const clients = data ?? [];
  const activeClient = clients.find((client) => client.status === 'active');
  const otherClients = clients.filter((client) => client !== activeClient);
  const hasActiveClient = activeClient != null;

  const novncUrlFor = (client: AnkifyClient) =>
    `http://${globalThis.location.hostname}:${client.novnc_port}/vnc.html`;

  return (
    <main className={sharedStyles.page}>
      <header className={sharedStyles.pageHeader}>
        <h1 className={sharedStyles.title}>Ankify (beta)</h1>
        <p className={sharedStyles.subtitle}>
          Run a hosted Anki desktop in your browser, sync Notion pages into it,
          and export your review data back. This surface is allowlisted.
        </p>
      </header>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Your Anki client</h2>
        </header>

        {isLoading && <p className={styles.emptyLine}>Loading clients…</p>}

        {error && (
          <p role="alert" className={sharedStyles.helpDanger}>
            Failed to load clients: {(error as Error).message}
          </p>
        )}

        {!isLoading && !error && !hasActiveClient && (
          <div className={styles.clientCard}>
            <div className={styles.clientCardHead}>
              <div className={styles.clientStatusBlock}>
                <span className={styles.clientStatusLabel}>Not provisioned</span>
                <span className={styles.clientName}>
                  No clients yet. Provision one to get started.
                </span>
              </div>
              <button
                type="button"
                className={`${sharedStyles.btnPrimary} ${styles.inlineButton}`}
                onClick={() => provision.mutate()}
                disabled={provision.isPending}
              >
                {provision.isPending ? 'Provisioning…' : 'Provision new client'}
              </button>
            </div>
            {provision.error && (
              <p role="alert" className={styles.alertInline}>
                {(provision.error as Error).message}
              </p>
            )}
          </div>
        )}

        {activeClient && (
          <div className={styles.clientCardActive}>
            <div className={styles.clientCardHead}>
              <div className={styles.clientStatusBlock}>
                <span className={styles.clientStatusLabel}>Active</span>
                <span className={styles.clientName}>
                  {activeClient.container_name ??
                    activeClient.container_id.slice(0, 12)}
                </span>
              </div>
              <div className={styles.clientActions}>
                <a
                  href={novncUrlFor(activeClient)}
                  target="_blank"
                  rel="noreferrer"
                  className={`${sharedStyles.btnPrimary} ${styles.inlineButton}`}
                >
                  Open Anki in browser
                </a>
                <button
                  type="button"
                  className={`${sharedStyles.btnSecondary} ${styles.inlineButton}`}
                  onClick={() => respin.mutate()}
                  disabled={respin.isPending}
                  title="Stop the container and start a fresh one with the same Anki collection"
                >
                  {respin.isPending ? 'Respinning…' : 'Respin'}
                </button>
                <button
                  type="button"
                  className={`${sharedStyles.btnDanger} ${styles.inlineButton}`}
                  onClick={() => stop.mutate(activeClient.id)}
                  disabled={stop.isPending}
                >
                  Stop
                </button>
              </div>
            </div>
            <dl className={styles.clientMeta}>
              <div className={styles.clientMetaItem}>
                <dt>noVNC</dt>
                <dd>:{activeClient.novnc_port}</dd>
              </div>
              <div className={styles.clientMetaItem}>
                <dt>AnkiConnect</dt>
                <dd>:{activeClient.anki_port}</dd>
              </div>
              <div
                className={styles.clientMetaItem}
                title={activeClient.container_id}
              >
                <dt>Container</dt>
                <dd>{activeClient.container_id.slice(0, 12)}</dd>
              </div>
            </dl>
            {provision.error && (
              <p role="alert" className={styles.alertInline}>
                {(provision.error as Error).message}
              </p>
            )}
            <div className={styles.provisionRow}>
              <button
                type="button"
                className={`${sharedStyles.btnSmall} ${styles.inlineButton}`}
                disabled
                aria-describedby="ankify-provision-help"
              >
                Already provisioned
              </button>
              <p id="ankify-provision-help" className={styles.provisionHelp}>
                One Anki client per account — stop the active one to provision
                a fresh container.
              </p>
            </div>
          </div>
        )}

        {otherClients.length > 0 && (
          <table className={styles.subscriptionTable}>
            <thead>
              <tr>
                <th>Container</th>
                <th>Status</th>
                <th>noVNC</th>
                <th>AnkiConnect</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {otherClients.map((client) => (
                <tr key={client.id}>
                  <td className={styles.mono}>
                    {client.container_name ?? client.container_id.slice(0, 12)}
                  </td>
                  <td>{client.status}</td>
                  <td>:{client.novnc_port}</td>
                  <td>:{client.anki_port}</td>
                  <td>
                    {client.status === 'active' && (
                      <button
                        type="button"
                        className={`${sharedStyles.btnDanger} ${styles.inlineButton}`}
                        onClick={() => stop.mutate(client.id)}
                        disabled={stop.isPending}
                      >
                        Stop
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {hasActiveClient ? (
        <>
          <SyncConflicts backend={backend} />
          <NotionSubscriptions backend={backend} />
          <ReviewDataExport backend={backend} />
        </>
      ) : (
        !isLoading &&
        !error && (
          <p className={styles.gatedNotice}>
            Sync, subscriptions, and the review-data export unlock once an Anki
            client is active.
          </p>
        )
      )}
    </main>
  );
}
