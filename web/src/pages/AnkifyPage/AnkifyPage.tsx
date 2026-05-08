import { ReactNode, useEffect, useState } from 'react';
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
import CheckIcon from '../../components/icons/CheckIcon';

const QUERY_KEY = ['ankify-clients'];
const ANKI_WEB_ACK_KEY = 'ankify_anki_web_acknowledged';
const SESSION_URL_PREFIX = 'ankify_session_url:';

const sessionUrlKey = (clientId: number) => `${SESSION_URL_PREFIX}${clientId}`;

const readCachedSessionUrl = (clientId: number): string | null => {
  try {
    return globalThis.localStorage?.getItem(sessionUrlKey(clientId)) ?? null;
  } catch {
    return null;
  }
};

const writeCachedSessionUrl = (clientId: number, url: string | null) => {
  try {
    if (url == null) {
      globalThis.localStorage?.removeItem(sessionUrlKey(clientId));
    } else {
      globalThis.localStorage?.setItem(sessionUrlKey(clientId), url);
    }
  } catch {}
};

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
    onSuccess: (client) => {
      if (client.session_url != null) {
        writeCachedSessionUrl(client.id, client.session_url);
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const stop = useMutation({
    mutationFn: (id: number) => api.stopAnkifyClient(id),
    onSuccess: (_response, id) => {
      writeCachedSessionUrl(id, null);
      try {
        globalThis.localStorage?.removeItem(ANKI_WEB_ACK_KEY);
      } catch {}
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const respin = useMutation({
    mutationFn: () => api.respinAnkifyClient(),
    onSuccess: (client) => {
      if (client.session_url != null) {
        writeCachedSessionUrl(client.id, client.session_url);
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const reissueSession = useMutation({
    mutationFn: (id: number) => api.reissueAnkifySessionUrl(id),
    onSuccess: (client) => {
      if (client.session_url != null) {
        writeCachedSessionUrl(client.id, client.session_url);
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
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

  const verifySignIn = useMutation({
    mutationFn: () => api.checkAnkifyAnkiWebStatus(),
    onSuccess: (result) => {
      if (result.status === 'linked') {
        acknowledgeAnkiWebSignIn();
      }
    },
  });

  useEffect(() => {
    if (
      ankiWebStatus.data?.status === 'linked' &&
      hasActiveClient &&
      !signedInAcknowledged
    ) {
      acknowledgeAnkiWebSignIn();
    }
  }, [ankiWebStatus.data?.status, hasActiveClient, signedInAcknowledged]);

  const ankiUrlFor = (client: AnkifyClient): string | null =>
    client.session_url ?? readCachedSessionUrl(client.id);

  const setupComplete = hasActiveClient && signedInAcknowledged;

  const step1State: StepState = hasActiveClient ? 'done' : 'current';
  let step2State: StepState = 'todo';
  if (signedInAcknowledged) step2State = 'done';
  else if (hasActiveClient) step2State = 'current';

  const heading = setupComplete ? 'Anki is ready.' : 'Ready to start studying?';
  const showLead = !hasActiveClient;
  const leadCopy = "Two quick steps and you're set.";

  const renderStepBadge = (state: StepState, n: number) =>
    state === 'done' ? (
      <span className={styles.setupStepBadge} aria-hidden="true">
        <CheckIcon width={14} height={14} />
      </span>
    ) : (
      <span className={styles.setupStepBadge} aria-hidden="true">
        {n}
      </span>
    );

  let statusBadge: ReactNode = null;
  if (setupComplete) {
    statusBadge = (
      <span className={sharedStyles.badgeSuccess}>Running</span>
    );
  } else if (hasActiveClient && !containerReady) {
    statusBadge = <span className={sharedStyles.badge}>Starting…</span>;
  } else if (hasActiveClient && containerReady) {
    statusBadge = (
      <span className={sharedStyles.badge}>Almost there</span>
    );
  }

  const activeUrl = activeClient != null ? ankiUrlFor(activeClient) : null;

  return (
    <main className={sharedStyles.page}>
      <header className={sharedStyles.pageHeader}>
        <h1 className={sharedStyles.title}>
          Ankify
          <span className={`${sharedStyles.badge} ${styles.headerBadge}`}>Beta</span>
        </h1>
        <p className={sharedStyles.subtitle}>
          Anki in your browser. Your Notion pages become decks, and the toggles
          inside become flashcards.
        </p>
      </header>

      <section className={sharedStyles.surface}>
        <header className={sharedStyles.surfaceHeader}>
          <div className={sharedStyles.surfaceHeaderText}>
            <h2
              className={
                setupComplete
                  ? sharedStyles.surfaceTitle
                  : `${sharedStyles.surfaceTitle} ${styles.setupHeading}`
              }
            >
              {heading}
            </h2>
            {showLead && (
              <p className={sharedStyles.surfaceLead}>{leadCopy}</p>
            )}
          </div>
          <div className={sharedStyles.surfaceActions}>
            {statusBadge}
            {setupComplete && activeClient != null && (
              <>
                {activeUrl != null ? (
                  <a
                    href={activeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`${sharedStyles.btnPrimary} ${styles.inlineButton}`}
                  >
                    Open Anki
                  </a>
                ) : (
                  <button
                    type="button"
                    className={`${sharedStyles.btnPrimary} ${styles.inlineButton}`}
                    onClick={() => reissueSession.mutate(activeClient.id)}
                    disabled={reissueSession.isPending}
                  >
                    {reissueSession.isPending ? 'Working…' : 'Get a new link'}
                  </button>
                )}
                <button
                  type="button"
                  className={`${sharedStyles.btnSecondary} ${styles.inlineButton}`}
                  onClick={() => respin.mutate()}
                  disabled={respin.isPending}
                  title="Restart Anki without losing your cards. Useful if it's stuck."
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
              </>
            )}
          </div>
        </header>

        {isLoading && (
          <p className={styles.emptyLine}>Loading your workspace…</p>
        )}

        {error && (
          <p role="alert" className={sharedStyles.helpDanger}>
            We couldn't load your workspace: {(error as Error).message}
          </p>
        )}

        {!isLoading && !error && (
          <ol className={styles.setupSteps}>
            <li className={stepClass(step1State)}>
              {renderStepBadge(step1State, 1)}
              <div className={styles.setupStepBody}>
                <div className={styles.setupStepHead}>
                  <span className={styles.setupStepIcon} aria-hidden="true">
                    <PlayIcon width={16} height={16} />
                  </span>
                  <p className={styles.setupStepTitle}>Start Anki</p>
                </div>
                <p className={styles.setupStepHint}>
                  We'll start a private Anki for you. Takes a few seconds.
                </p>
                {step1State === 'current' && (
                  <div className={styles.setupStepActions}>
                    <button
                      type="button"
                      className={`${sharedStyles.btnPrimary} ${styles.inlineButton}`}
                      onClick={() => provision.mutate()}
                      disabled={provision.isPending}
                    >
                      {provision.isPending ? 'Starting…' : 'Start Anki'}
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
                      Try again — most starts work on the second go. If it
                      keeps failing, email hello@2anki.net.
                    </p>
                  </div>
                )}
              </div>
            </li>

            <li className={stepClass(step2State)}>
              {renderStepBadge(step2State, 2)}
              <div className={styles.setupStepBody}>
                <div className={styles.setupStepHead}>
                  <span className={styles.setupStepIcon} aria-hidden="true">
                    <UserIcon width={16} height={16} />
                  </span>
                  <p className={styles.setupStepTitle}>Sign in to AnkiWeb</p>
                </div>
                <p className={styles.setupStepHint}>
                  Open Anki, click <strong>Sync</strong> in the toolbar, then
                  enter your AnkiWeb email and password. After that, we keep
                  AnkiWeb up to date whenever a Notion page changes.
                </p>
                {step2State === 'current' && activeClient && (
                  readiness.data?.ready ? (
                    <>
                      <div className={styles.setupStepActions}>
                        {ankiUrlFor(activeClient) != null ? (
                          <a
                            href={ankiUrlFor(activeClient)!}
                            target="_blank"
                            rel="noreferrer"
                            className={`${sharedStyles.btnSecondary} ${styles.inlineButton}`}
                          >
                            Open Anki
                          </a>
                        ) : (
                          <button
                            type="button"
                            className={`${sharedStyles.btnSecondary} ${styles.inlineButton}`}
                            onClick={() =>
                              reissueSession.mutate(activeClient.id)
                            }
                            disabled={reissueSession.isPending}
                          >
                            {reissueSession.isPending
                              ? 'Working…'
                              : 'Get a new link'}
                          </button>
                        )}
                        <button
                          type="button"
                          className={`${sharedStyles.btnPrimary} ${styles.inlineButton}`}
                          onClick={() => verifySignIn.mutate()}
                          disabled={verifySignIn.isPending}
                        >
                          {verifySignIn.isPending
                            ? 'Checking…'
                            : "I've signed in"}
                        </button>
                      </div>
                      {verifySignIn.isSuccess &&
                        verifySignIn.data.status !== 'linked' && (
                          <p
                            role="alert"
                            className={sharedStyles.helpDanger}
                          >
                            {verifySignIn.data.status === 'unreachable'
                              ? "We can't reach Anki right now. Try again in a few seconds."
                              : "We don't see you signed in to AnkiWeb yet. Click "}
                            {verifySignIn.data.status !== 'unreachable' && (
                              <strong>Sync</strong>
                            )}
                            {verifySignIn.data.status !== 'unreachable' &&
                              ' inside Anki, enter your AnkiWeb email and password, then try again.'}
                          </p>
                        )}
                      {verifySignIn.isError && (
                        <p role="alert" className={sharedStyles.helpDanger}>
                          We couldn't check your sign-in.{' '}
                          {(verifySignIn.error as Error).message}
                        </p>
                      )}
                      {!verifySignIn.isSuccess && !verifySignIn.isError && (
                        <p
                          className={styles.setupStepHint}
                          aria-live="polite"
                        >
                          We'll move on automatically once AnkiWeb is linked.
                        </p>
                      )}
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
                        Starting Anki — usually 5 to 15 seconds.
                      </p>
                    </div>
                  )
                )}
              </div>
            </li>

          </ol>
        )}

        {activeClient != null && (
          <div className={sharedStyles.surfaceFooter}>
            <span>Workspace ID</span>
            <span title={activeClient.container_id}>
              {activeClient.container_name ??
                activeClient.container_id.slice(0, 12)}
            </span>
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
          <p
            className={`${sharedStyles.notificationInfo} ${styles.gatedNotice}`}
          >
            The rest of this page unlocks once AnkiWeb is linked. Finish the
            steps above.
          </p>
        )
      )}
    </main>
  );
}
