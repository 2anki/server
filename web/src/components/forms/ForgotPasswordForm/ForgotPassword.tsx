import styles from '../../../styles/auth.module.css';
import sharedStyles from '../../../styles/shared.module.css';

interface ForgotPasswordProp {
  didReset: boolean;
  loading: boolean;
}

export function ForgotPassword({ didReset, loading }: ForgotPasswordProp) {
  if (didReset) {
    return (
      <p className={sharedStyles.smallDescription}>
        You should receive an email if your account exists.
      </p>
    );
  }

  return (
    <div className={styles.field}>
      <button type="submit" className={styles.submitButton} disabled={loading}>
        Reset my password
      </button>
    </div>
  );
}
