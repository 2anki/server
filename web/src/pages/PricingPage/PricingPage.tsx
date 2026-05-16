import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { getVisibleText } from '../../lib/text/getVisibleText';
import { get2ankiApi } from '../../lib/backend/get2ankiApi';
import { getLifetimeLink, getSubscribeLink } from './payment.links';
import { PricingCard } from './components/PricingCard';
import { AutoSyncCard } from './components/AutoSyncCard';
import TopMessage from '../../components/TopMessage/TopMessage';
import {
  MONTHLY_PRICE,
  MONTHLY_SUFFIX,
  AUTO_SYNC_LAUNCH_DATE,
  AUTO_SYNC_NEW_CHIP_DAYS,
} from './pricing.constants';
import { firePaywallEvent } from '../../lib/analytics/firePaywallEvent';
import styles from './PricingPage.module.css';

interface PricingPageProps {
  isLoggedIn: boolean;
  email?: string;
  hostedAnkiRequested?: boolean;
  trialStartedAt?: string | null;
  patreon?: boolean | null;
  signupCountry?: string | null;
  autoSyncCapReached?: boolean;
  autoSyncActive?: boolean;
  onTrialStarted?: () => void;
}

type RequestState = 'idle' | 'pending' | 'sent' | 'error';

function isAutoSyncNewChipVisible(): boolean {
  const daysSinceLaunch =
    (Date.now() - AUTO_SYNC_LAUNCH_DATE.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceLaunch < AUTO_SYNC_NEW_CHIP_DAYS;
}

function autoSyncCaption(
  patreon: boolean | null | undefined,
  autoSyncActive: boolean,
  hostedAnkiRequested: boolean
): string | undefined {
  if (patreon === true) {
    return 'Included in your Lifetime plan';
  }
  if (autoSyncActive) {
    return undefined;
  }
  if (hostedAnkiRequested) {
    return 'Waitlist is open — subscribe anytime.';
  }
  return undefined;
}

export default function PricingPage({
  isLoggedIn,
  email,
  hostedAnkiRequested = false,
  trialStartedAt,
  patreon,
  signupCountry,
  autoSyncCapReached = false,
  autoSyncActive = false,
  onTrialStarted,
}: Readonly<PricingPageProps>) {
  const isUS = signupCountry === 'US';
  const subcribeLink = isLoggedIn
    ? getSubscribeLink(email)
    : '/login?redirect=/pricing';
  const lifetimeLink = getLifetimeLink();
  const [waitlistState, setWaitlistState] = useState<RequestState>('idle');
  const [trialState, setTrialState] = useState<RequestState>('idle');
  const [subscribeError, setSubscribeError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const fromPaywall = searchParams.get('source') === 'paywall-cancel';
  const fromContext = searchParams.get('from');
  const showContextBanner = fromContext != null && !isLoggedIn ? false : fromContext != null;

  const isLifetime = patreon === true;
  const showAutoSyncNew = isAutoSyncNewChipVisible();

  const showTrialCta =
    isLoggedIn &&
    patreon !== true &&
    trialStartedAt == null &&
    trialState !== 'sent';

  useEffect(() => {
    if (fromPaywall) {
      firePaywallEvent('paywall_pricing_viewed');
    }
  }, [fromPaywall]);

  const handleWaitlistRequest = async () => {
    if (!isLoggedIn) {
      globalThis.location.href = '/login?redirect=/pricing';
      return;
    }
    setWaitlistState('pending');
    try {
      await get2ankiApi().requestHostedAnkiAccess();
      setWaitlistState('sent');
    } catch {
      setWaitlistState('error');
    }
  };

  const handleAutoSyncSubscribe = async () => {
    if (!isLoggedIn) {
      globalThis.location.href = '/login?redirect=/pricing';
      return;
    }
    setSubscribeError(null);
    const result = await get2ankiApi().startAutoSyncCheckout();
    if ('url' in result) {
      globalThis.location.href = result.url;
      return;
    }
    if (result.status === 'cap_reached') {
      await handleWaitlistRequest();
      return;
    }
    if (result.status === 'already_subscribed') {
      globalThis.location.href = '/ankify/setup';
      return;
    }
    setSubscribeError("Couldn't start checkout. Try again, or email support@2anki.net.");
  };

  const handleStartTrial = async () => {
    setTrialState('pending');
    try {
      const result = await get2ankiApi().startTrial();
      if (result.ok) {
        setTrialState('sent');
        onTrialStarted?.();
      } else {
        setTrialState('error');
      }
    } catch {
      setTrialState('error');
    }
  };

  const autoSyncCaptionText = subscribeError
    ?? autoSyncCaption(patreon, autoSyncActive, hostedAnkiRequested);

  const showCapReached = autoSyncCapReached && !isLifetime && !autoSyncActive;

  function getWaitlistLabel(): string {
    if (waitlistState === 'pending') {
      return 'Joining…';
    }
    if (waitlistState === 'sent') {
      return 'On the waitlist';
    }
    return 'Join the waitlist';
  }
  const waitlistLabel = getWaitlistLabel();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <p className={styles.kicker}>
          <span className={styles.kickerDot} aria-hidden="true" />
          <span>Plans</span>
        </p>
        <h1 className={styles.title}>{getVisibleText('pricing.page.title')}</h1>
        <TopMessage />
        {showContextBanner && (
          <div className={styles.contextBanner} role="status">
            You're on the free plan — 100 cards per month.
          </div>
        )}
        <p className={styles.intro}>
          {isUS
            ? 'Built for spaced repetition — MCAT, USMLE, bar exam, and language prep. 100 cards a month free, plus one Anki → Notion import.'
            : 'Free for everyone — 100 cards per month, plus one Anki → Notion import to try it out.'}
          {!isLoggedIn && (
            <>
              {' '}
              <a href="/register" className={styles.introLink}>
                Start free{' '}
                <span className={styles.introArrow} aria-hidden="true">
                  →
                </span>
              </a>
            </>
          )}
        </p>
      </div>

      {showTrialCta && (
        <div className={styles.trialCta}>
          <button
            type="button"
            className={styles.trialButton}
            onClick={handleStartTrial}
            disabled={trialState === 'pending'}
          >
            {trialState === 'pending'
              ? 'Starting trial…'
              : 'Try Unlimited free for 1 hour — no card needed'}
          </button>
        </div>
      )}

      <div className={styles.grid}>
        <PricingCard
          className={styles.cardPro}
          badge="Best for most"
          price={MONTHLY_PRICE}
          priceSuffix={MONTHLY_SUFFIX}
          title="Unlimited"
          benefits={[
            'Unlimited flashcards',
            'Run multiple conversions at once',
            'PDFs and large Notion exports',
            'Unlimited Anki → Notion imports',
            'Print decks to PDF',
            'Cancel anytime',
          ]}
          link={subcribeLink}
          linkText="Upgrade"
        />

        <AutoSyncCard
          showNewBadge={showAutoSyncNew}
          isLifetime={isLifetime}
          isActive={autoSyncActive}
          capReached={showCapReached}
          caption={autoSyncCaptionText}
          waitlistLabel={waitlistLabel}
          waitlistDisabled={waitlistState === 'pending' || waitlistState === 'sent'}
          onSubscribe={handleAutoSyncSubscribe}
          onWaitlist={handleWaitlistRequest}
        />

        <PricingCard
          className={styles.cardLifetime}
          price="$345"
          priceSuffix="– $500"
          priceRange
          title="Lifetime"
          benefits={[
            'All Unlimited features, paid once',
            'Auto Sync included',
            'No future price changes',
          ]}
          link={lifetimeLink}
          linkText="Apply"
          variant="outline"
          caption="By application — we usually reply within a day."
        />
      </div>

      <p className={styles.philosophy}>
        You don't have to upgrade — free works forever. Paid plans unlock more,
        and help fund 2anki.net.
      </p>
    </div>
  );
}
