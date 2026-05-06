import { Link } from 'react-router-dom';
import useQuery from '../../lib/hooks/useQuery';
import styles from '../../styles/shared.module.css';

function TopMessage() {
  const query = useQuery();
  const errorMessage = query.get('error');

  if (errorMessage === 'upload_limit_exceeded') {
    return (
      <div className={styles.alertDanger}>
        <p>
          You&apos;ve reached your conversion limit.{' '}
          <Link to="/pricing">Upgrade</Link> to convert more.
        </p>
      </div>
    );
  }
  if (errorMessage) {
    return (
      <div className={styles.alertDanger}>
        <p>{errorMessage}</p>
      </div>
    );
  }

  return null;
}

export default TopMessage;
