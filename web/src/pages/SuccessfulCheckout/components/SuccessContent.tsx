import { UserActionCards } from './UserActionCards';
import { TimeoutWarning } from './TimeoutWarning';
import styles from '../../../styles/shared.module.css';

const settingsLink = 'https://2anki.net/settings';
const supportLink = 'mailto:support@2anki.net';

interface SuccessContentProps {
  timeoutReached: boolean;
}

export const SuccessContent = ({ timeoutReached }: SuccessContentProps) => {
  return (
    <>
      <h1 className={styles.title}>Your payment has been confirmed</h1>

      <p>
        To start using your new features, log in or create an account with the{' '}
        <strong>same email address</strong> you used at checkout.
      </p>

      <UserActionCards />

      <p>
        <strong>Used a different email for payment?</strong>
      </p>
      <p>
        You can link payment and login emails from your{' '}
        <a href={settingsLink}>settings page</a> after signing in.
      </p>

      <p>
        Having trouble logging in? Email{' '}
        <a href={supportLink}>support@2anki.net</a>.
      </p>

      <TimeoutWarning show={timeoutReached} />
    </>
  );
};
