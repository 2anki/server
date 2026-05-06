import styles from '../AccountPage.module.css';

interface User {
  name: string;
  email: string;
  picture?: string | null;
}

interface UserProfileProps {
  readonly user: User;
}

export function UserProfile({ user }: UserProfileProps) {
  return (
    <div className={styles.profileSection}>
      <div className={styles.profileInfo}>
        <p className={styles.profileName} data-hj-suppress>
          {user.name}
        </p>
        <p className={styles.profileEmail} data-hj-suppress>
          {user.email}
        </p>
      </div>
    </div>
  );
}
