import { useNavigate } from 'react-router-dom';
import styles from '../../../styles/shared.module.css';

interface LoggedInSuccessProps {
  firstName?: string;
}

export const LoggedInSuccess = ({ firstName }: LoggedInSuccessProps) => {
  const navigate = useNavigate();
  const subhead = firstName
    ? `Thanks, ${firstName} — your subscription is active.`
    : 'Your subscription is active.';

  return (
    <div className={`${styles.card} ${styles.textCenter}`}>
      <h1 className={styles.title}>You're on Unlimited</h1>
      <p className={styles.subtitle}>{subhead}</p>
      <div className={`${styles.flexColumn} ${styles.marginTopLg}`}>
        <button
          type="button"
          className={`${styles.btnPrimary} ${styles.btnInline}`}
          onClick={() => navigate('/upload')}
        >
          Make a deck
        </button>
        <a
          href="/account"
          className={`${styles.btnSecondary} ${styles.marginTopSm}`}
        >
          Go to account
        </a>
      </div>
    </div>
  );
};
