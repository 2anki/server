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

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{getVisibleText('pricing.page.title')}</h1>
        <TopMessage />
        <p className={styles.subtitle}>
          Choose the plan that works best for you. Our monthly subscription can
          be canceled at any time, while our lifetime access offers a one-time
          payment solution with no recurring fees.
        </p>
      </div>

      <div className={styles.grid}>
        <PricingCard
          title="Free Plan"
          price="$0"
          benefits={['100 flashcards and max upload (100mb)']}
        />
        <PricingCard
          price="$6"
          title="Subscriber Plan - Monthly"
          benefits={[
            'Unlimited Flashcards (9GB++)',
            'PDF support using Vertex AI',
            'Cancel anytime - no commitment required',
          ]}
          link={subcribeLink}
          linkText="Subscribe"
        />
        <PricingCard
          price="$105"
          title="Lifetime Access"
          benefits={[
            'Forever premium access to 2anki.net',
            'PDF support using Vertex AI',
            'One-time payment - no subscription needed',
          ]}
          link={lifetimeLink}
          linkText="Contact us"
        />
      </div>

      <div className={styles.footer}>
        <p>
          Lifetime access is available by application only. Please contact{' '}
          <a href="mailto:support@2anki.net">support@2anki.net</a> to apply.
        </p>
      </div>
    </div>
  );
}
