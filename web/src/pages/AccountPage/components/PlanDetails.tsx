import styles from '../AccountPage.module.css';
import sharedStyles from '../../../styles/shared.module.css';

interface PlanDetailsProps {
  readonly subscriptionType: 'subscriber' | 'lifetime' | 'free';
}

export function PlanDetails({ subscriptionType }: PlanDetailsProps) {
  if (subscriptionType === 'subscriber') {
    return (
      <div className={styles.planCard}>
        <div className={styles.planHeader}>
          <div>
            <h3 className={styles.planName}>Monthly Subscription</h3>
            <ul className={sharedStyles.featureList}>
              <li>Unlimited Flashcards (9GB++)</li>
              <li>PDF support using Vertex AI</li>
              <li>Priority Support</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (subscriptionType === 'lifetime') {
    return (
      <div className={styles.planCard}>
        <h3 className={styles.planName}>Lifetime Access</h3>
        <p className={styles.planDescription}>Valid forever</p>
        <ul className={sharedStyles.featureList}>
          <li>Unlimited Flashcards (9GB++)</li>
          <li>PDF support using Vertex AI</li>
          <li>Priority Support</li>
          <li>All Future Updates</li>
        </ul>
      </div>
    );
  }

  return (
    <div className={styles.planCard}>
      <div className={styles.planHeader}>
        <div>
          <h3 className={styles.planName}>Free Plan</h3>
          <ul className={sharedStyles.featureList}>
            <li>100 flashcards per upload</li>
            <li>Max upload size: 100mb</li>
            <li>Community Support</li>
          </ul>
        </div>
        <a href="/pricing" className={styles.planButton}>
          Upgrade
        </a>
      </div>
    </div>
  );
}
