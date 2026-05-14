import Confetti from 'react-confetti';

import styles from '../../styles/shared.module.css';
import { useSubscriptionStatus } from './hooks/useSubscriptionStatus';
import { LoadingState } from './components/LoadingState';
import { SuccessContent } from './components/SuccessContent';
import { LoggedInSuccess } from './components/LoggedInSuccess';

export default function SuccessfulCheckout() {
  const { shouldShowLoading, timeoutReached, showConfirmation, data } =
    useSubscriptionStatus();

  if (shouldShowLoading) {
    return <LoadingState />;
  }

  if (showConfirmation && data?.authenticated) {
    const firstName = data.user?.name?.split(' ')[0];
    return (
      <div className={styles.pageNarrow}>
        <LoggedInSuccess firstName={firstName} />
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          gravity={0.05}
          recycle={false}
        />
      </div>
    );
  }

  return (
    <div className={styles.pageNarrow}>
      <SuccessContent timeoutReached={timeoutReached} />

      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        gravity={0.05}
        recycle={false}
      />
    </div>
  );
}
