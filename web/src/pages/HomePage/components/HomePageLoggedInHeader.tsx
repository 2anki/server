import { useUserLocals } from '../../../lib/hooks/useUserLocals';
import styles from '../../../styles/shared.module.css';

export function HomePageLoggedInHeader() {
  const { data } = useUserLocals();
  const title = data?.user?.name;
  return (
    <h2 className={styles.subHeading}>
      Welcome back{title ? `, ${title}!` : ''}
    </h2>
  );
}
