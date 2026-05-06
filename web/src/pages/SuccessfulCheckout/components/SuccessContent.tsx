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
        Your payment has been successfully processed. To access your newly
        unlocked features and start using our service, you will need to either
        log in to your existing account or create a new one.
      </p>

      <UserActionCards />

      <p>
        <strong>Important Note:</strong>
      </p>
      <p>
        To ensure a smooth experience, please ensure you log in or register
        using the <strong>same email address</strong> you used during your
        payment.
      </p>

      <p>
        In case you use different email addresses (e.g., Gmail for daily use and
        web.de for payments), you can still link them after logging in. Head
        over to your Settings page for more information:
        <a href={settingsLink}>{settingsLink}</a>
      </p>

      <p>
        <strong>
          Having trouble logging in with the email used for payment?
        </strong>
        {
          " Don't worry, we're here to help! Feel free to reach out to on eamil via this link: "
        }
        <a href={supportLink}>email link</a>.
      </p>

      <TimeoutWarning show={timeoutReached} />
    </>
  );
};
