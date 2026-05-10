import { getVisibleText } from '../../lib/text/getVisibleText';
import { getLifetimeLink, getSubscribeLink } from './payment.links';
import { PricingCard } from './components/PricingCard';
import TopMessage from '../../components/TopMessage/TopMessage';
import styles from './PricingPage.module.css';

interface PricingPageProps {
  isLoggedIn: boolean;
  email?: string;
}

export default function PricingPage({
  isLoggedIn,
  email,
}: Readonly<PricingPageProps>) {
  const subcribeLink = isLoggedIn
    ? getSubscribeLink(email)
    : '/login?redirect=/pricing';
  const lifetimeLink = getLifetimeLink();
  const freeLink = isLoggedIn ? undefined : '/register';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{getVisibleText('pricing.page.title')}</h1>
        <TopMessage />
      </div>

      <div className={styles.grid}>
        <PricingCard
          title="Free"
          price="$0"
          benefits={[
            '100 cards a month',
            'Try it on a real Notion page',
          ]}
          link={freeLink}
          linkText={freeLink ? 'Start free' : undefined}
        />
        <PricingCard
          price="$6"
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
          price="$105"
          title="Lifetime"
          benefits={[
            'Everything in Student, paid once',
            'Ankify (hosted Notion ↔ Anki sync)',
            'No future price changes',
            'One-time payment',
          ]}
          link={lifetimeLink}
          linkText="Apply"
        />
      </div>

      <div className={styles.footer}>
        <p>
          Lifetime is application-only — write to{' '}
          <a href="mailto:support@2anki.net">support@2anki.net</a> and tell us
          how you use 2anki.
        </p>
      </div>
    </div>
  );
}
