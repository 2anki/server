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
  idle: 'Request access',
  pending: 'Sending…',
  sent: 'Request sent ✓',
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
          Free for everyone — 100 cards per conversion.
          {!isLoggedIn && (
            <>
              {' '}
              <a href="/register">Start free →</a>
            </>
          )}
        </p>
        <p className={styles.intro}>
          Lifetime ($345, includes Ankify) is application-only — email{' '}
          <a href={lifetimeLink}>support@2anki.net</a>.
        </p>
      </div>

      <div className={styles.grid}>
        <PricingCard
          price="$6 / mo"
          title="Student"
          benefits={[
            'Unlimited flashcards',
            'PDFs and large Notion exports',
            'Cancel anytime',
          ]}
          link={subcribeLink}
          linkText="Subscribe"
        />
        <PricingCard
          price="$20 / mo"
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
      </div>
    </div>
  );
}
