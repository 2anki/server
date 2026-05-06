import { getGoogleSignInUrl } from '../../lib/backend/getGoogleSignInUrl';
import styles from '../../styles/auth.module.css';

interface WithGoogleLinkProps {
  text: string;
}

export function WithGoogleLink({ text }: WithGoogleLinkProps) {
  return (
    <a href={getGoogleSignInUrl()} className={styles.googleButton}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        width="20px"
        height="20px"
      >
        <path
          fill="#4285F4"
          d="M24 9.5c3.9 0 7.1 1.3 9.5 3.4l7.1-7.1C35.8 2.1 30.2 0 24 0 14.6 0 6.6 5.4 2.5 13.3l8.3 6.4C13.1 13.1 18.1 9.5 24 9.5z"
        />
        <path
          fill="#34A853"
          d="M46.5 24c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3.1-2.4 5.7-4.9 7.4l7.6 5.9c4.4-4.1 7.1-10.1 7.1-17.8z"
        />
        <path
          fill="#FBBC05"
          d="M12.8 28.7c-1.1-3.1-1.1-6.5 0-9.6L4.5 12.7C1.6 17.8 0 23.7 0 30s1.6 12.2 4.5 17.3l8.3-6.4z"
        />
        <path
          fill="#EA4335"
          d="M24 48c6.5 0 12-2.1 16-5.7l-7.6-5.9c-2.2 1.5-5 2.4-8.4 2.4-5.9 0-10.9-3.6-12.7-8.7l-8.3 6.4C6.6 42.6 14.6 48 24 48z"
        />
        <path fill="none" d="M0 0h48v48H0z" />
      </svg>
      <span>{text}</span>
    </a>
  );
}
