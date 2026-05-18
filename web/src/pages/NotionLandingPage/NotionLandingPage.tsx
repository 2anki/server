import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { track } from '../../lib/analytics/track';
import { PricingCard } from '../PricingPage/components/PricingCard';
import {
  AUTO_SYNC_PRICE,
  MONTHLY_PRICE,
  MONTHLY_SUFFIX,
} from '../PricingPage/pricing.constants';
import styles from './NotionLandingPage.module.css';

const REF = 'notion-marketplace';
const CANONICAL = 'https://2anki.net/notion-marketplace';

const CONNECT_HREF = `/register?source=${REF}&ref=${REF}`;
const AUTO_SYNC_HREF = `/pricing?ref=${REF}`;
const UNLIMITED_HREF = `/pricing?ref=${REF}`;

const AUTO_SYNC_BENEFITS = [
  'Notion edits sync to Anki every 5 minutes',
  'No exports, no zips, no manual steps',
  'Cancel anytime',
];

const UNLIMITED_BENEFITS = [
  'Unlimited flashcards from Notion exports',
  'PDF, Markdown, HTML, and CSV support',
  'Cancel anytime',
];

export function NotionLandingPage() {
  useEffect(() => {
    track('paywall_shown', { surface: REF });
  }, []);

  const handleAutoSyncClick = () => {
    track('paywall_upgrade_clicked', { surface: REF, plan: 'auto_sync' });
  };

  const handleUnlimitedClick = () => {
    track('paywall_upgrade_clicked', { surface: REF, plan: 'unlimited' });
  };

  return (
    <div className={styles.page}>
      <Helmet>
        <title>Notion to Anki — automatic sync | 2anki</title>
        <meta
          name="description"
          content="Connect your Notion workspace and your notes become Anki flashcards automatically. No exports, no zips. Auto Sync $30/mo, Unlimited $6/mo."
        />
        <link rel="canonical" href={CANONICAL} />
        <meta
          property="og:title"
          content="Notion to Anki — automatic sync | 2anki"
        />
        <meta
          property="og:description"
          content="Connect your Notion workspace and your notes become Anki flashcards automatically. No exports, no zips. Auto Sync $30/mo, Unlimited $6/mo."
        />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:type" content="website" />
      </Helmet>

      <section className={styles.hero}>
        <h1 className={styles.heroHeadline}>
          Your Notion notes become Anki cards — automatically
        </h1>
        <p className={styles.heroSubhead}>
          Connect your workspace in 5 minutes. No exports, no zips, no manual
          steps.
        </p>
        <a href={CONNECT_HREF} className={styles.heroCta}>
          Connect Notion
        </a>
        <p className={styles.paywallNotice}>
          Auto Sync requires a $30/mo subscription. Connect to start your setup.
        </p>
      </section>

      <hr className={styles.divider} />

      <section className={styles.plans}>
        <p className={styles.plansLabel}>Plans</p>
        <div className={styles.plansGrid}>
          <PricingCard
            badge="Recommended"
            title="Auto Sync"
            price={AUTO_SYNC_PRICE}
            priceSuffix={MONTHLY_SUFFIX}
            benefits={AUTO_SYNC_BENEFITS}
            link={AUTO_SYNC_HREF}
            linkText="Get Auto Sync"
            onLinkClick={handleAutoSyncClick}
          />
          <PricingCard
            title="Unlimited"
            price={MONTHLY_PRICE}
            priceSuffix={MONTHLY_SUFFIX}
            benefits={UNLIMITED_BENEFITS}
            link={UNLIMITED_HREF}
            linkText="Get Unlimited"
            variant="outline"
            caption="Prefer to export manually? Unlimited has no card limit."
            onLinkClick={handleUnlimitedClick}
          />
        </div>
      </section>
    </div>
  );
}

export default NotionLandingPage;
