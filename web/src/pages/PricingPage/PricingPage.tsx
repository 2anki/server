import { useState } from 'react';

import { getVisibleText } from '../../lib/text/getVisibleText';
import { get2ankiApi } from '../../lib/backend/get2ankiApi';
import { getLifetimeLink, getSubscribeLink } from './payment.links';
import { PricingCard } from './components/PricingCard';
import TopMessage from '../../components/TopMessage/TopMessage';
import styles from './PricingPage.module.css';

interface PricingPageProps {
  isLoggedIn: boolean;
  email?: string;
  hostedAnkiRequested?: boolean;
}

type RequestState = 'idle' | 'pending' | 'sent' | 'error';

const HOSTED_ANKI_LABELS: Record<RequestState, string> = {
  idle: 'Join the waitlist',
  pending: 'Joining…',
  sent: 'On the waitlist ✓',
  error: 'Try again',
};

export default function PricingPage({
  isLoggedIn,
  email,
  hostedAnkiRequested,
}: Readonly<PricingPageProps>) {
  const subcribeLink = isLoggedIn
    ? getSubscribeLink(email)
    : '/login?redirect=/pricing';
  const lifetimeLink = getLifetimeLink();
  const [hostedAnkiState, setHostedAnkiState] = useState<RequestState>(
    hostedAnkiRequested ? 'sent' : 'idle'
  );

  const handleHostedAnkiRequest = async () => {
    if (!isLoggedIn) {
      window.location.href = '/login?redirect=/pricing';
      return;
    }
    setHostedAnkiState('pending');
    try {
      await get2ankiApi().requestHostedAnkiAccess();
      setHostedAnkiState('sent');
    } catch {
      setHostedAnkiState('error');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{getVisibleText('pricing.page.title')}</h1>
        <TopMessage />
        <p className={styles.intro}>
          Free for everyone — 100 cards per upload. Convert as often as you
          like.
          {!isLoggedIn && (
            <>
              {' '}
              <a href="/register" className={styles.introLink}>
                Start free →
              </a>
            </>
          )}
        </p>
      </div>

      <div className={styles.grid}>
        <PricingCard
          className={styles.cardPro}
          price="$6 / mo"
          title="Pro"
          benefits={[
            'Unlimited flashcards',
            'PDFs and large Notion exports',
            'Cancel anytime',
          ]}
          link={subcribeLink}
          linkText="Get Pro"
        />
        <PricingCard
          className={styles.cardHosted}
          priceChip="Coming soon"
          title="Hosted Anki"
          benefits={[
            'Convert once, sync forever',
            'Notion edits flow to your decks automatically',
            'No manual upload or download',
          ]}
          comingSoon
          onAction={handleHostedAnkiRequest}
          actionLabel={HOSTED_ANKI_LABELS[hostedAnkiState]}
          actionDisabled={
            hostedAnkiState === 'pending' || hostedAnkiState === 'sent'
          }
        />
        <PricingCard
          className={styles.cardLifetime}
          price="$345–$500"
          title="Lifetime"
          benefits={[
            'Everything in Pro, paid once',
            'Hosted Anki included',
            'No future price changes',
          ]}
          link={lifetimeLink}
          linkText="Apply"
          variant="outline"
          caption="By application — we usually reply within a day."
        />
      </div>
    </div>
  );
}
