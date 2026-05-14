import styles from '../../styles/auth.module.css';

interface WithNotionLinkProps {
  text: string;
}

export function WithNotionLink({ text }: Readonly<WithNotionLinkProps>) {
  return (
    <a href="/api/users/auth/notion/init" className={styles.notionButton}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20px"
        height="20px"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M4 4h4l8 12V4h4v16h-4L8 8v12H4V4z" />
      </svg>
      <span>{text}</span>
    </a>
  );
}
