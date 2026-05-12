import styles from '../../styles/auth.module.css';
import sharedStyles from '../../styles/shared.module.css';

interface EmailProviderLink {
  label: string;
  href: string;
}

function getEmailProviderLinks(email: string): EmailProviderLink[] {
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain == null) return [];

  const links: EmailProviderLink[] = [];

  if (domain === 'gmail.com') {
    links.push({ label: 'Open Gmail', href: 'https://mail.google.com' });
  }
  if (
    domain === 'outlook.com' ||
    domain === 'hotmail.com' ||
    domain === 'live.com'
  ) {
    links.push({
      label: 'Open Outlook',
      href: 'https://outlook.live.com',
    });
  }
  if (domain === 'yahoo.com') {
    links.push({ label: 'Open Yahoo Mail', href: 'https://mail.yahoo.com' });
  }

  return links;
}

interface CheckYourEmailProps {
  email: string;
  onRetry: () => void;
  purpose: 'login' | 'password_reset';
}

function CheckYourEmail({
  email,
  onRetry,
  purpose,
}: Readonly<CheckYourEmailProps>) {
  const isLogin = purpose === 'login';
  const linkType = isLogin ? 'login link' : 'password reset link';
  const actionText = isLogin ? 'log in' : 'reset your password';
  const providerLinks = getEmailProviderLinks(email);

  return (
    <div className={styles.formPage}>
      <div className={styles.formCard}>
        <h1 className={styles.formTitle}>Check your email</h1>
        <p className={sharedStyles.formDescription}>
          We sent a {linkType} to <strong>{email}</strong>. Click the link in
          the email to {actionText}. It expires in 15 minutes.
        </p>
        {providerLinks.length > 0 && (
          <div className={sharedStyles.flexRow} style={{ marginBottom: '1rem' }}>
            {providerLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className={sharedStyles.btnSmall}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
        <p className={styles.footerText}>
          {"Didn't get it? Check your spam folder, or "}
          <a
            href="#retry"
            onClick={(e) => {
              e.preventDefault();
              onRetry();
            }}
          >
            try again
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export default CheckYourEmail;
