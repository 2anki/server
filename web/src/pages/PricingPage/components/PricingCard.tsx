import styles from '../PricingPage.module.css';

interface PricingCardProp {
  price: string;
  title: string;
  benefits: string[];
  link?: string;
  linkText?: string;
}

export function PricingCard({
  price,
  title,
  benefits,
  linkText,
  link,
}: Readonly<PricingCardProp>) {
  return (
    <div className={styles.card}>
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
      {link && linkText && (
        <div className={styles.cardFooter}>
          <a href={link} className={styles.cardButton}>
            {linkText}
          </a>
        </div>
      )}
    </div>
  );
}
