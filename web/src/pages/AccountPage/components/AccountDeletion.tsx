import styles from '../AccountPage.module.css';

export function AccountDeletion() {
  return (
    <div className={styles.dangerSection}>
      <h4 className={styles.dangerTitle}>Delete Account</h4>
      <div className={styles.dangerNotice}>
        <strong>Warning:</strong> Deleting your account will permanently remove
        all your data and cannot be undone.
      </div>
      <a
        href="/delete-account"
        className={styles.dangerButton}
        onClick={(e) => {
          if (
            !confirm(
              'Are you sure you want to delete your account? This action cannot be undone.'
            )
          ) {
            e.preventDefault();
          }
        }}
      >
        Delete Account
      </a>
    </div>
  );
}
