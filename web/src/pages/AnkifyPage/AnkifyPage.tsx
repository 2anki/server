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
  const inactiveClients = clients.filter((client) => client !== activeClient);
  const hasActiveClient = activeClient != null;

  const ankiUrlFor = (client: AnkifyClient) =>
    `http://${globalThis.location.hostname}:${client.novnc_port}/vnc.html`;

  return (
    <main className={sharedStyles.page}>
      <header className={sharedStyles.pageHeader}>
        <h1 className={sharedStyles.title}>
          Ankify
          <span className={styles.betaBadge}>Private beta</span>
        </h1>
        <p className={sharedStyles.subtitle}>
          Anki, running in your browser. Your Notion pages flow in, your daily
          reviews flow back out.
        </p>
      </header>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Your Anki workspace</h2>
        </header>

        {isLoading && <p className={styles.emptyLine}>Loading your workspace…</p>}

        {error && (
          <p role="alert" className={sharedStyles.helpDanger}>
            We couldn't load your workspace: {(error as Error).message}
          </p>
        )}

        {!isLoading && !error && !hasActiveClient && (
          <div className={styles.emptyClientCard}>
            <p className={styles.emptyClientTitle}>
              Set up your hosted Anki
            </p>
            <p className={styles.emptyClientCopy}>
              No clients yet. We'll start a private Anki desktop you can open
              from your browser. Takes a few seconds.
            </p>
            <button
              type="button"
              className={`${sharedStyles.btnPrimary} ${styles.inlineButton}`}
              onClick={() => provision.mutate()}
              disabled={provision.isPending}
            >
              {provision.isPending ? 'Setting up…' : 'Provision new client'}
            </button>
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
                <span className={styles.statusRow}>
                  <span className={styles.statusDot} aria-hidden="true" />
                  <span className={styles.statusLabel}>Running</span>
                </span>
                <p className={styles.clientHeadline}>
                  Your Anki is ready
                </p>
                <span className={styles.clientName}>
                  {activeClient.container_name ??
                    activeClient.container_id.slice(0, 12)}
                </span>
              </div>
              <div className={styles.clientActions}>
                <a
                  href={ankiUrlFor(activeClient)}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.openButton}
                >
                  Open Anki
                </a>
                <button
                  type="button"
                  className={`${sharedStyles.btnSecondary} ${styles.inlineButton}`}
                  onClick={() => respin.mutate()}
                  disabled={respin.isPending}
                  title="Restart with the same collection — useful if Anki is unresponsive"
                >
                  {respin.isPending ? 'Restarting…' : 'Restart'}
                </button>
                <button
                  type="button"
                  className={`${sharedStyles.btnDanger} ${styles.inlineButton}`}
                  onClick={() => stop.mutate(activeClient.id)}
                  disabled={stop.isPending}
                >
                  {stop.isPending ? 'Shutting down…' : 'Shut down'}
                </button>
              </div>
            </div>

            {provision.error && (
              <p role="alert" className={styles.alertInline}>
                {(provision.error as Error).message}
              </p>
            )}

            <details className={styles.detailsBlock}>
              <summary className={styles.detailsSummary}>
                Connection details
              </summary>
              <div className={styles.detailsBody}>
                <dl className={styles.clientMeta}>
                  <div className={styles.metaItem}>
                    <dt>Workspace ID</dt>
                    <dd title={activeClient.container_id}>
                      {activeClient.container_id.slice(0, 12)}
                    </dd>
                  </div>
                  <div className={styles.metaItem}>
                    <dt>Anki desktop port</dt>
                    <dd>{activeClient.novnc_port}</dd>
                  </div>
                  <div className={styles.metaItem}>
                    <dt>Tools port</dt>
                    <dd>{activeClient.anki_port}</dd>
                  </div>
                </dl>
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
                    One workspace at a time. Shut this one down to start a new
                    one.
                  </p>
                </div>
              </div>
            </details>
          </div>
        )}

        {inactiveClients.length > 0 &&
          inactiveClients.map((client) => {
            const label = client.status === 'active' ? 'Running' : 'Shut down';
            return (
              <div key={client.id} className={styles.inactiveSummary}>
                <span>
                  <span className={styles.statusDotIdle} aria-hidden="true" />{' '}
                  {label} ·{' '}
                  <span className={styles.inactiveName}>
                    {client.container_name ?? client.container_id.slice(0, 12)}
                  </span>
                </span>
              </div>
            );
          })}
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
            Set up Anki first. Notion sync, conflicts, and the daily review
            export unlock once it's running.
          </p>
        )
      )}
    </main>
  );
}
