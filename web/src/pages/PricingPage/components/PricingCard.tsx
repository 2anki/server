import styles from '../PricingPage.module.css';

interface PricingCardProp {
  price: string;
  title: string;
  benefits: string[];
  link?: string;
  linkText?: string;
  onAction?: () => void;
  actionLabel?: string;
  actionDisabled?: boolean;
  comingSoon?: boolean;
}

export function PricingCard({
  price,
  title,
  benefits,
  linkText,
  link,
  onAction,
  actionLabel,
  actionDisabled,
  comingSoon,
}: Readonly<PricingCardProp>) {
  const cardClass = comingSoon ? styles.cardComingSoon : styles.card;
  const showButton = onAction != null && actionLabel != null;
  const showLink = !showButton && link != null && linkText != null;

  return (
    <div className={cardClass}>
      <div className={styles.cardHeader}>
        <p className={styles.cardPrice}>{price}</p>
        <p className={styles.cardTitle}>{title}</p>
      </div>
      <div className={styles.cardBody}>
        {benefits.map((benefit) => (
          <p key={benefit} className={styles.benefit}>
            {benefit}
          </p>
        ))}
      </div>
      {(showButton || showLink) && (
        <div className={styles.cardFooter}>
          {showButton && (
            <button
              type="button"
              className={styles.cardButton}
              onClick={onAction}
              disabled={actionDisabled}
            >
              {actionLabel}
            </button>
          )}
          {showLink && (
            <a href={link} className={styles.cardButton}>
              {linkText}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
