import styles from '../../../styles/shared.module.css';

interface TimeoutWarningProps {
  show: boolean;
}

export const TimeoutWarning = ({ show }: TimeoutWarningProps) => {
  if (!show) return null;

  return (
    <div className={styles.notificationWarning}>
      <p>
        <strong>Note:</strong> We're still processing your subscription
        activation. If you're already logged in, you can try visiting the{' '}
        <a href="/notion">Notion page</a> directly, or refresh this page to
        check again.
      </p>
    </div>
  );
};
