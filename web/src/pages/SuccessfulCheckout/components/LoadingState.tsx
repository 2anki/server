import Confetti from 'react-confetti';
import styles from '../../../styles/shared.module.css';

export const LoadingState = () => {
  return (
    <div className={`${styles.pageNarrow} ${styles.textCenter}`}>
      <h1 className={styles.title}>Processing your payment...</h1>
      <div className={`${styles.flexCenter} ${styles.spinnerContainer}`}>
        <div className={styles.spinner} />
      </div>
      <p className={styles.subtitle}>
        We're activating your subscription. This usually takes just a few
        seconds.
      </p>
      <p className={styles.secondaryText}>
        You'll be automatically redirected once your subscription is active.
      </p>
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        gravity={0.05}
        recycle={false}
      />
    </div>
  );
};
