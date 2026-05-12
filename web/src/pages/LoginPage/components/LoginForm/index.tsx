import { useState, SyntheticEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import TopMessage from '../../../../components/TopMessage/TopMessage';
import CheckYourEmail from '../../../../components/CheckYourEmail/CheckYourEmail';
import { isValidCredentials } from './helpers/isValidCredentials';
import { useHandleLoginSubmit } from './helpers/useHandleLoginSubmit';
import { getVisibleText } from '../../../../lib/text/getVisibleText';
import { WithGoogleLink } from '../../../../components/forms/WithGoogleLink';
import { get2ankiApi } from '../../../../lib/backend/get2ankiApi';
import styles from '../../../../styles/auth.module.css';

type LoginStep = 'email' | 'password' | 'check-email';

function LoginForm() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<LoginStep>('email');
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const { email, password, loading, onSubmit, setEmail, setPassword } =
    useHandleLoginSubmit((e) => setError((e as Error).message));

  const registerHref =
    searchParams.get('error') === 'upload_limit_exceeded'
      ? '/register?redirect=/pricing'
      : '/register';

  const handleContinueWithEmail = (event: SyntheticEvent) => {
    event.preventDefault();
    setError(null);
    setStep('password');
  };

  const handleSendMagicLink = async () => {
    setMagicLinkLoading(true);
    setError(null);
    try {
      await get2ankiApi().requestMagicLink(email, 'login');
      setStep('check-email');
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setMagicLinkLoading(false);
    }
  };

  const handleRetryMagicLink = () => {
    setStep('email');
  };

  if (step === 'check-email') {
    return (
      <CheckYourEmail
        email={email}
        onRetry={handleRetryMagicLink}
        purpose="login"
      />
    );
  }

  const isEmailStep = step === 'email';

  return (
    <div className={styles.formPage}>
      <div className={styles.formCard}>
        <TopMessage />
        <h1 className={styles.formTitle}>Log in</h1>
        {isEmailStep ? (
          <>
            <form onSubmit={handleContinueWithEmail}>
              <div className={styles.field}>
                <label htmlFor="email">
                  <span>Email</span>
                  <input
                    id="email"
                    name="email"
                    min="3"
                    max="255"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      localStorage.setItem('email', event.target.value);
                    }}
                    type="email"
                    placeholder="Email address"
                    required
                  />
                </label>
              </div>
              <div className={styles.field}>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={email.length === 0}
                >
                  Continue with email
                </button>
                {error && <p className={styles.helpDanger}>{error}</p>}
              </div>
            </form>
            <div className={styles.divider}>
              <span className={styles.dividerLabel}>or</span>
            </div>
            <WithGoogleLink
              text={getVisibleText('navigation.login.google')}
            />
          </>
        ) : (
          <form onSubmit={onSubmit}>
            <div className={styles.field}>
              <label htmlFor="email">
                <span>Email</span>
                <input
                  id="email"
                  name="email"
                  value={email}
                  type="email"
                  readOnly
                />
              </label>
              <p className={styles.helpMuted}>
                <a
                  href="#change"
                  onClick={(e) => {
                    e.preventDefault();
                    setError(null);
                    setStep('email');
                  }}
                >
                  Change
                </a>
              </p>
            </div>
            <div className={styles.field}>
              <label htmlFor="password">
                <span>Password</span>
                <input
                  id="password"
                  name="password"
                  min="8"
                  max="255"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  placeholder="Password"
                  autoFocus
                />
              </label>
            </div>
            <div className={styles.field}>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={!isValidCredentials(email, password) || loading}
              >
                {loading ? 'Logging in…' : 'Log in'}
              </button>
              {error && <p className={styles.helpDanger}>{error}</p>}
            </div>
            <p className={styles.footerText}>
              <a rel="noreferrer" href="/forgot">
                Forgot your password?
              </a>
            </p>
            <p className={styles.footerText}>
              <a
                href="#magic-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleSendMagicLink();
                }}
              >
                {magicLinkLoading
                  ? 'Sending'
                  : 'Send a login link instead'}
              </a>
            </p>
          </form>
        )}
        <p className={styles.footerText}>
          {getVisibleText('navigation.register.question')}{' '}
          <a rel="noreferrer" href={registerHref}>
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
