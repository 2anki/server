import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import sharedStyles from '../../styles/shared.module.css';
import styles from './AnkifyPage.module.css';
import { get2ankiApi } from '../../lib/backend/get2ankiApi';
import { Backend } from '../../lib/backend/Backend';
import AnkifyClient from '../../lib/interfaces/AnkifyClient';
import { Skeleton } from '../../components/Skeleton/Skeleton';

const QUERY_KEY = ['ankify-clients'];
const ANKI_WEB_ACK_KEY = 'ankify_anki_web_acknowledged';
const SESSION_URL_PREFIX = 'ankify_session_url:';

const sessionUrlKey = (clientId: number) => `${SESSION_URL_PREFIX}${clientId}`;

const writeCachedSessionUrl = (clientId: number, url: string | null) => {
  try {
    if (url == null) {
      globalThis.localStorage?.removeItem(sessionUrlKey(clientId));
    } else {
      globalThis.localStorage?.setItem(sessionUrlKey(clientId), url);
    }
  } catch {}
};

const readCachedSessionUrl = (clientId: number): string | null => {
  try {
    return globalThis.localStorage?.getItem(sessionUrlKey(clientId)) ?? null;
  } catch {
    return null;
  }
};

const readSignedInAcknowledged = (): boolean => {
  try {
    return globalThis.localStorage?.getItem(ANKI_WEB_ACK_KEY) === 'true';
  } catch {
    return false;
  }
};

interface Props {
  readonly backend?: Backend;
}

export default function AnkifySetupPage({ backend }: Props) {
  const api = backend ?? get2ankiApi();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [signedInAcknowledged, setSignedInAcknowledged] = useState<boolean>(
    readSignedInAcknowledged
  );

  const { data, isLoading } = useQuery<AnkifyClient[]>({
    queryKey: QUERY_KEY,
    queryFn: () => api.listAnkifyClients(),
  });

  const activeClient = (data ?? []).find((c) => c.status === 'active');
  const hasActiveClient = activeClient != null;

  const readiness = useQuery({
    queryKey: ['ankify-active-ready'],
    queryFn: () => api.checkAnkifyActiveClientReady(),
    enabled: hasActiveClient,
    refetchInterval: (query) =>
      (query.state.data as { ready?: boolean } | undefined)?.ready === true
        ? false
        : 2000,
  });

  const containerReady = readiness.data?.ready === true;

  const ankiWebStatus = useQuery({
    queryKey: ['ankify-anki-web-status'],
    queryFn: () => api.checkAnkifyAnkiWebStatus(),
    enabled: hasActiveClient && containerReady,
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

  const reissueSession = useMutation({
    mutationFn: (id: number) => api.reissueAnkifySessionUrl(id),
    onSuccess: (client) => {
      if (client.session_url != null) {
        writeCachedSessionUrl(client.id, client.session_url);
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

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

  useEffect(() => {
    if (!hasActiveClient && signedInAcknowledged) {
      setSignedInAcknowledged(false);
      try {
        globalThis.localStorage?.removeItem(ANKI_WEB_ACK_KEY);
      } catch {}
    }
  }, [hasActiveClient, signedInAcknowledged]);

  useEffect(() => {
    if (!isLoading && hasActiveClient && signedInAcknowledged) {
      navigate('/ankify', { replace: true });
    }
  }, [isLoading, hasActiveClient, signedInAcknowledged, navigate]);

  if (isLoading) {
    return (
      <main className={styles.setupTakeover}>
        <Skeleton width="60%" height="2rem" />
        <Skeleton width="80%" height="1rem" />
      </main>
    );
  }

  const ankiUrlFor = (client: AnkifyClient): string | null =>
    client.session_url ?? readCachedSessionUrl(client.id);

  const renderStartAnkiStep = () => (
    <section className={styles.setupActiveStep}>
      <p className={styles.setupActiveStepLabel}>Step 1 of 2</p>
      <h2 className={styles.setupActiveStepTitle}>Start Anki</h2>
      <p className={styles.setupActiveStepHint}>
        We'll start a private Anki for you. Takes a few seconds.
      </p>
      {provision.isPending ? (
        <div
          className={styles.setupActiveStepActions}
          role="status"
          aria-live="polite"
        >
          <Skeleton width="11rem" height="2.25rem" radius="0.4rem" />
          <p className={styles.setupActiveStepHint}>
            Starting Anki — usually 5 to 15 seconds.
          </p>
        </div>
      ) : (
        <div className={styles.setupActiveStepActions}>
          <button
            type="button"
            className={`${sharedStyles.btnPrimary} ${styles.inlineButton}`}
            onClick={() => provision.mutate()}
            disabled={provision.isPending}
          >
            Start Anki
          </button>
        </div>
      )}
      {provision.error && (
        <div className={styles.provisionErrorBlock} role="alert">
          <p className={styles.provisionErrorTitle}>
            We couldn't start your Anki.
          </p>
          <p className={styles.provisionErrorBody}>
            {(provision.error as Error).message}
          </p>
          <p className={styles.provisionErrorHint}>
            Try again — most starts work on the second go. If it keeps failing,
            email hello@2anki.net.
          </p>
        </div>
      )}
    </section>
  );

  const renderStartingStep = () => (
    <section className={styles.setupActiveStep}>
      <p className={styles.setupActiveStepLabel}>Step 1 of 2</p>
      <h2 className={styles.setupActiveStepTitle}>Start Anki</h2>
      <div
        className={styles.setupActiveStepActions}
        role="status"
        aria-live="polite"
      >
        <Skeleton width="11rem" height="2.25rem" radius="0.4rem" />
        <p className={styles.setupActiveStepHint}>
          Starting Anki — usually 5 to 15 seconds.
        </p>
      </div>
    </section>
  );

  const renderSignInStep = (client: AnkifyClient) => {
    const verifyStatus = verifySignIn.data?.status;
    const sessionUrl = ankiUrlFor(client);
    return (
      <section className={styles.setupActiveStep}>
        <p className={styles.setupActiveStepLabel}>Step 2 of 2</p>
        <h2 className={styles.setupActiveStepTitle}>Sign in to AnkiWeb</h2>
        <p className={styles.setupActiveStepHint}>
          Open Anki, click <strong>Sync</strong> in the toolbar, then enter
          your AnkiWeb email and password. After that, we keep AnkiWeb up to
          date whenever a Notion page changes.
        </p>
        <div className={styles.setupActiveStepActions}>
          {sessionUrl != null ? (
            <a
              href={sessionUrl}
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
              onClick={() => reissueSession.mutate(client.id)}
              disabled={reissueSession.isPending}
            >
              {reissueSession.isPending ? 'Working…' : 'Get a new link'}
            </button>
          )}
          <button
            type="button"
            className={`${sharedStyles.btnPrimary} ${styles.inlineButton}`}
            onClick={() => verifySignIn.mutate()}
            disabled={verifySignIn.isPending}
          >
            {verifySignIn.isPending ? 'Checking…' : "I've signed in"}
          </button>
        </div>
        {verifySignIn.isSuccess && verifyStatus !== 'linked' && (
          <div
            role="alert"
            className={`${sharedStyles.alertDanger} ${styles.signInAlert}`}
          >
            {verifyStatus === 'unreachable' ? (
              "We can't reach Anki right now. Try again in a few seconds."
            ) : (
              <>
                We don't see you signed in to AnkiWeb yet. Open Anki, click{' '}
                <strong>Sync</strong> in the toolbar, enter your AnkiWeb email
                and password, then come back and try again.
              </>
            )}
          </div>
        )}
        {verifySignIn.isError && (
          <div
            role="alert"
            className={`${sharedStyles.alertDanger} ${styles.signInAlert}`}
          >
            We couldn't check your sign-in.{' '}
            {(verifySignIn.error as Error).message}
          </div>
        )}
        {!verifySignIn.isSuccess && !verifySignIn.isError && (
          <p className={styles.setupActiveStepHint} aria-live="polite">
            We'll move on automatically once AnkiWeb is linked.
          </p>
        )}
      </section>
    );
  };

  let activeStep: ReactNode;
  let nextPreview: ReactNode | null = null;

  if (!hasActiveClient) {
    activeStep = renderStartAnkiStep();
    nextPreview = <p>Sign in to AnkiWeb (next)</p>;
  } else if (!containerReady) {
    activeStep = renderStartingStep();
    nextPreview = <p>Sign in to AnkiWeb (next)</p>;
  } else {
    activeStep = renderSignInStep(activeClient);
  }

  return (
    <main className={styles.setupTakeover}>
      <header className={styles.setupTakeoverHeading}>
        <h1 className={styles.setupTakeoverTitle}>
          Set up Anki in your browser.
        </h1>
        <p className={styles.setupTakeoverSubtitle}>
          About a minute, two steps.
        </p>
      </header>
      {activeStep}
      {nextPreview != null && (
        <div className={styles.setupNextPreview}>{nextPreview}</div>
      )}
    </main>
  );
}
