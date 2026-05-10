import { ReactNode } from 'react';

import styles from '../PricingPage.module.css';

interface PricingCardProp {
  price?: string;
  priceChip?: string;
  title: string;
  benefits: string[];
  link?: string;
  linkText?: string;
  onAction?: () => void;
  actionLabel?: string;
  actionDisabled?: boolean;
  comingSoon?: boolean;
  variant?: 'primary' | 'outline';
  caption?: string;
  className?: string;
}

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

export function PricingCard({
  price,
  priceChip,
  title,
  benefits,
  linkText,
  link,
  onAction,
  actionLabel,
  actionDisabled,
  comingSoon,
  variant = 'primary',
  caption,
  className,
}: Readonly<PricingCardProp>) {
  const baseCardClass = comingSoon ? styles.cardComingSoon : styles.card;
  const cardClass =
    className == null ? baseCardClass : `${baseCardClass} ${className}`;
  const buttonClass =
    variant === 'outline' ? styles.cardButtonOutline : styles.cardButton;
  const showButton = onAction != null && actionLabel != null;
  const showLink = !showButton && link != null && linkText != null;

  let priceNode: ReactNode = null;
  if (price != null) {
    priceNode = <p className={styles.cardPrice}>{price}</p>;
  } else if (priceChip != null) {
    priceNode = <span className={styles.cardPriceChip}>{priceChip}</span>;
  }

  return (
    <div className={cardClass}>
      <div className={styles.cardHeader}>
        <p className={styles.cardTitle}>{title}</p>
        {priceNode}
      </div>
      <div className={styles.cardBody}>
        {benefits.map((benefit) => (
          <p key={benefit} className={styles.benefit}>
            <CheckIcon />
            <span>{benefit}</span>
          </p>
        ))}
      </div>
      {(showButton || showLink || caption != null) && (
        <div className={styles.cardFooter}>
          {showButton && (
            <button
              type="button"
              className={buttonClass}
              onClick={onAction}
              disabled={actionDisabled}
            >
              {actionLabel}
            </button>
          )}
          {showLink && (
            <a href={link} className={buttonClass}>
              {linkText}
            </a>
          )}
          {caption != null && <p className={styles.cardCaption}>{caption}</p>}
        </div>
      )}
    </div>
  );
}
