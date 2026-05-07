import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import sharedStyles from '../../styles/shared.module.css';
import styles from './AnkifyPage.module.css';
import { get2ankiApi } from '../../lib/backend/get2ankiApi';
import AnkifyClient from '../../lib/interfaces/AnkifyClient';
import { Backend } from '../../lib/backend/Backend';
import ReviewDataExport from './components/ReviewDataExport';
import NotionSubscriptions from './components/NotionSubscriptions';
import SyncConflicts from './components/SyncConflicts';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import PlayIcon from '../../components/icons/PlayIcon';
import UserIcon from '../../components/icons/UserIcon';
import RefreshIcon from '../../components/icons/RefreshIcon';
import SparkleIcon from '../../components/icons/SparkleIcon';

const QUERY_KEY = ['ankify-clients'];
const ANKI_WEB_ACK_KEY = 'ankify_anki_web_acknowledged';

interface AnkifyPageProps {
  backend?: Backend;
}

type StepState = 'todo' | 'current' | 'done';

const stepClass = (state: StepState) => {
  if (state === 'done') return styles.setupStepDone;
  if (state === 'current') return styles.setupStepCurrent;
  return styles.setupStepTodo;
};

export default function AnkifyPage({ backend }: Readonly<AnkifyPageProps>) {
  const api = backend ?? get2ankiApi();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<AnkifyClient[]>({
    queryKey: QUERY_KEY,
    queryFn: () => api.listAnkifyClients(),
  });

  const readiness = useQuery({
    queryKey: ['ankify-active-ready'],
    queryFn: () => api.checkAnkifyActiveClientReady(),
    enabled: data != null && data.some((c) => c.status === 'active'),
    refetchInterval: (query) =>
      (query.state.data as { ready?: boolean } | undefined)?.ready === true
        ? false
        : 2000,
  });

  const hasActiveClientNow =
    data != null && data.some((c) => c.status === 'active');
  const containerReady = readiness.data?.ready === true;

  const ankiWebStatus = useQuery({
    queryKey: ['ankify-anki-web-status'],
    queryFn: () => api.checkAnkifyAnkiWebStatus(),
    enabled: hasActiveClientNow && containerReady,
    refetchInterval: (query) =>
      (query.state.data as { status?: string } | undefined)?.status === 'linked'
        ? false
        : 15_000,
  });

  const provision = useMutation({
    mutationFn: () => api.provisionAnkifyClient(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const stop = useMutation({
    mutationFn: (id: number) => api.stopAnkifyClient(id),
    onSuccess: () => {
      try {
        globalThis.localStorage?.removeItem(ANKI_WEB_ACK_KEY);
      } catch {}
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const respin = useMutation({
    mutationFn: () => api.respinAnkifyClient(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const clients = data ?? [];
  const activeClient = clients.find((client) => client.status === 'active');
  const hasActiveClient = activeClient != null;

  const [signedInAcknowledged, setSignedInAcknowledged] = useState<boolean>(
    () => {
      try {
        return globalThis.localStorage?.getItem(ANKI_WEB_ACK_KEY) === 'true';
      } catch {
        return false;
      }
    }
  );

  useEffect(() => {
    if (!hasActiveClient && signedInAcknowledged) {
      setSignedInAcknowledged(false);
      try {
        globalThis.localStorage?.removeItem(ANKI_WEB_ACK_KEY);
      } catch {}
    }
  }, [hasActiveClient, signedInAcknowledged]);

  const acknowledgeAnkiWebSignIn = () => {
    setSignedInAcknowledged(true);
    try {
      globalThis.localStorage?.setItem(ANKI_WEB_ACK_KEY, 'true');
    } catch {}
  };

  useEffect(() => {
    if (
      ankiWebStatus.data?.status === 'linked' &&
      hasActiveClient &&
      !signedInAcknowledged
    ) {
      acknowledgeAnkiWebSignIn();
    }
  }, [ankiWebStatus.data?.status, hasActiveClient, signedInAcknowledged]);

  const ankiUrlFor = (client: AnkifyClient) =>
    `http://${globalThis.location.hostname}:${client.novnc_port}/vnc.html`;

  const setupComplete = hasActiveClient && signedInAcknowledged;

  const step1State: StepState = hasActiveClient ? 'done' : 'current';
  let step2State: StepState = 'todo';
  if (signedInAcknowledged) step2State = 'done';
  else if (hasActiveClient) step2State = 'current';

  const step3State: StepState = 'todo';

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
          <h2 className={styles.sectionTitle}>
            {setupComplete ? 'Your Anki workspace' : 'Set up your Anki'}
          </h2>
          {setupComplete && (
            <span className={styles.setupCompleteBadge}>
              <span className={styles.statusDot} aria-hidden="true" />
              Running, AnkiWeb linked
            </span>
          )}
        </header>

        {isLoading && (
          <p className={styles.emptyLine}>Loading your workspace…</p>
        )}

        {error && (
          <p role="alert" className={sharedStyles.helpDanger}>
            We couldn't load your workspace: {(error as Error).message}
          </p>
        )}

        {!isLoading && !error && !setupComplete && (
          <div className={styles.setupCard}>
            <p className={styles.setupLead}>
              {hasActiveClient
                ? "Anki is running. Two more steps and you're set."
                : "No clients yet. Three quick steps and you're set."}
            </p>

            <ol className={styles.setupSteps}>
              <li className={stepClass(step1State)}>
                <span
                  className={styles.setupStepBadge}
                  aria-hidden="true"
                >
                  1
                </span>
                <div className={styles.setupStepBody}>
                  <div className={styles.setupStepHead}>
                    <span className={styles.setupStepIcon} aria-hidden="true">
                      <PlayIcon width={16} height={16} />
                    </span>
                    <p className={styles.setupStepTitle}>Start Anki</p>
                  </div>
                  <p className={styles.setupStepHint}>
                    We boot a private Anki desktop you can open in your browser.
                    Takes a few seconds.
                  </p>
                  {step1State === 'current' && (
                    <div className={styles.setupStepActions}>
                      <button
                        type="button"
                        className={`${sharedStyles.btnPrimary} ${styles.inlineButton}`}
                        onClick={() => provision.mutate()}
                        disabled={provision.isPending}
                      >
                        {provision.isPending ? 'Setting up…' : 'Start Anki'}
                      </button>
                    </div>
                  )}
                  {provision.error && step1State === 'current' && (
                    <div className={styles.provisionErrorBlock} role="alert">
                      <p className={styles.provisionErrorTitle}>
                        We couldn't start your Anki.
                      </p>
                      <p className={styles.provisionErrorBody}>
                        {(provision.error as Error).message}
                      </p>
                      <p className={styles.provisionErrorHint}>
                        Try again — most boots succeed on a second attempt. If
                        it keeps failing, email us at hello@2anki.net.
                      </p>
                    </div>
                  )}
                </div>
              </li>

              <li className={stepClass(step2State)}>
                <span
                  className={styles.setupStepBadge}
                  aria-hidden="true"
                >
                  2
                </span>
                <div className={styles.setupStepBody}>
                  <div className={styles.setupStepHead}>
                    <span className={styles.setupStepIcon} aria-hidden="true">
                      <UserIcon width={16} height={16} />
                    </span>
                    <p className={styles.setupStepTitle}>
                      Sign in to AnkiWeb inside the Anki window
                    </p>
                  </div>
                  <p className={styles.setupStepHint}>
                    Open Anki, then click <strong>Sync</strong> in the toolbar
                    and enter your AnkiWeb email and password. This is what
                    links your hosted Anki to your AnkiWeb account.
                  </p>
                  {step2State === 'current' && activeClient && (
                    readiness.data?.ready ? (
                      <>
                        <div className={styles.setupStepActions}>
                          <a
                            href={ankiUrlFor(activeClient)}
                            target="_blank"
                            rel="noreferrer"
                            className={`${sharedStyles.btnSecondary} ${styles.inlineButton}`}
                          >
                            Open Anki
                          </a>
                          <button
                            type="button"
                            className={`${sharedStyles.btnPrimary} ${styles.inlineButton}`}
                            onClick={acknowledgeAnkiWebSignIn}
                          >
                            I've signed in
                          </button>
                        </div>
                        <p
                          className={styles.setupStepHint}
                          aria-live="polite"
                        >
                          Watching for AnkiWeb sign-in — this will advance on
                          its own once you're linked.
                        </p>
                      </>
                    ) : (
                      <div
                        className={styles.setupStepActions}
                        role="status"
                        aria-live="polite"
                      >
                        <Skeleton width="11rem" height="2.25rem" radius="0.4rem" />
                        <Skeleton width="7rem" height="2.25rem" radius="0.4rem" />
                        <p className={styles.setupStepHint}>
                          Anki is starting up — usually 5–15 seconds.
                        </p>
                      </div>
                    )
                  )}
                </div>
              </li>

              <li className={stepClass(step3State)}>
                <span
                  className={styles.setupStepBadge}
                  aria-hidden="true"
                >
                  3
                </span>
                <div className={styles.setupStepBody}>
                  <div className={styles.setupStepHead}>
                    <span className={styles.setupStepIcon} aria-hidden="true">
                      <RefreshIcon width={16} height={16} />
                    </span>
                    <p className={styles.setupStepTitle}>
                      Run your first sync
                    </p>
                  </div>
                  <p className={styles.setupStepHint}>
                    Back in Anki, press <strong>Y</strong> or click{' '}
                    <strong>Sync</strong> once. After that, we keep AnkiWeb in
                    step every time a Notion page changes.
                  </p>
                </div>
              </li>
            </ol>

            {hasActiveClient && (
              <details className={styles.detailsBlock}>
                <summary className={styles.detailsSummary}>
                  Workspace details
                </summary>
                <div className={styles.detailsBody}>
                  <dl className={styles.clientMeta}>
                    <div className={styles.metaItem}>
                      <dt>Workspace</dt>
                      <dd
                        title={activeClient!.container_id}
                        className={styles.clientName}
                      >
                        {activeClient!.container_name ??
                          activeClient!.container_id.slice(0, 12)}
                      </dd>
                    </div>
                    <div className={styles.metaItem}>
                      <dt>Anki desktop port</dt>
                      <dd>{activeClient!.novnc_port}</dd>
                    </div>
                    <div className={styles.metaItem}>
                      <dt>Tools port</dt>
                      <dd>{activeClient!.anki_port}</dd>
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
                    <p
                      id="ankify-provision-help"
                      className={styles.provisionHelp}
                    >
                      One workspace at a time. Shut this one down to start a
                      new one.
                    </p>
                  </div>
                  <div className={styles.setupManageRow}>
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
                      onClick={() => stop.mutate(activeClient!.id)}
                      disabled={stop.isPending}
                    >
                      {stop.isPending ? 'Shutting down…' : 'Shut down'}
                    </button>
                  </div>
                </div>
              </details>
            )}
          </div>
        )}

        {!isLoading && !error && setupComplete && activeClient && (
          <div className={styles.clientCardActive}>
            <div className={styles.clientCardHead}>
              <div className={styles.clientStatusBlock}>
                <p className={styles.clientHeadline}>
                  <span className={styles.clientHeadlineIcon} aria-hidden="true">
                    <SparkleIcon width={18} height={18} />
                  </span>
                  Your Anki is ready and AnkiWeb is linked.
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
                    aria-describedby="ankify-provision-help-active"
                  >
                    Already provisioned
                  </button>
                  <p
                    id="ankify-provision-help-active"
                    className={styles.provisionHelp}
                  >
                    One workspace at a time. Shut this one down to start a new
                    one.
                  </p>
                </div>
              </div>
            </details>
          </div>
        )}
      </section>

      {setupComplete ? (
        <>
          <SyncConflicts backend={backend} />
          <NotionSubscriptions backend={backend} />
          <ReviewDataExport backend={backend} />
        </>
      ) : (
        !isLoading &&
        !error && (
          <p className={styles.gatedNotice}>
            Once AnkiWeb is linked, you'll choose which Notion pages flow into
            Anki and decide when to send your reviews back. Finish the steps
            above to unlock them.
          </p>
        )
      )}
    </main>
  );
}
