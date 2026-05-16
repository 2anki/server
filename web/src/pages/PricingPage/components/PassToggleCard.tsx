import { useState } from 'react';

import styles from '../PricingPage.module.css';
import toggleStyles from './PassToggleCard.module.css';

type PassKind = '24h' | '7d';

const PASS_BENEFITS = [
  'Unlimited conversions',
  'All upload formats — Notion, .zip, .html, .md, .csv, .apkg',
  'Image occlusion',
  'Custom card templates',
];

const DAY_PASS = {
  price: '$4',
  suffix: '/ 24 hours',
  description: 'Unlimited conversions for 24 hours. Pay once, no subscription.',
  buttonLabel: 'Get Day Pass',
  kind: '24h' as PassKind,
};

const WEEK_PASS = {
  price: '$9',
  suffix: '/ 1 week',
  description: 'Unlimited conversions for 1 week. Pay once, no subscription.',
  buttonLabel: 'Get Week Pass',
  kind: '7d' as PassKind,
};

function CheckIcon() {
  return (
    <svg
      className={styles.benefitIcon}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 8.5l3 3 6-6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface PassToggleCardProps {
  onCheckout: (kind: PassKind) => void;
  pending: boolean;
}

export function PassToggleCard({
  onCheckout,
  pending,
}: Readonly<PassToggleCardProps>) {
  const [selected, setSelected] = useState<PassKind>('24h');

  const copy = selected === '24h' ? DAY_PASS : WEEK_PASS;

  return (
    <div className={toggleStyles.wrapper}>
      <div className={`${styles.card} ${toggleStyles.card}`}>
        <div className={styles.cardHeader}>
          <span className={toggleStyles.badge}>Pay once</span>
          <p className={styles.cardTitle}>Pass</p>

          <div
            className={toggleStyles.segmented}
            role="group"
            aria-label="Pass duration"
          >
            <button
              type="button"
              className={`${toggleStyles.pill} ${selected === '24h' ? toggleStyles.pillActive : ''}`}
              aria-selected={selected === '24h'}
              onClick={() => setSelected('24h')}
            >
              24 hours
            </button>
            <button
              type="button"
              className={`${toggleStyles.pill} ${selected === '7d' ? toggleStyles.pillActive : ''}`}
              aria-selected={selected === '7d'}
              onClick={() => setSelected('7d')}
            >
              1 week
            </button>
          </div>

          <span className={styles.cardPriceLine}>
            <span className={styles.cardPrice}>{copy.price}</span>
            <span className={styles.cardPriceSuffix}>{copy.suffix}</span>
          </span>

          <p className={toggleStyles.description}>{copy.description}</p>
        </div>

        <div className={styles.cardBody}>
          {PASS_BENEFITS.map((benefit) => (
            <p key={benefit} className={styles.benefit}>
              <CheckIcon />
              <span>{benefit}</span>
            </p>
          ))}
        </div>

        <div className={styles.cardFooter}>
          <button
            type="button"
            className={styles.cardButton}
            onClick={() => onCheckout(copy.kind)}
            disabled={pending}
          >
            {pending ? 'Redirecting…' : copy.buttonLabel}
          </button>
          <p className={styles.cardCaption}>Starts the moment you pay</p>
        </div>
      </div>
    </div>
  );
}
