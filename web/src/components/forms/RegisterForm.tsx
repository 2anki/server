import { SyntheticEvent, useMemo, useState } from 'react';
import TopMessage from '../TopMessage/TopMessage';
import { ErrorHandlerType } from '../errors/helpers/getErrorMessage';
import { get2ankiApi } from '../../lib/backend/get2ankiApi';
import { WithGoogleLink } from './WithGoogleLink';
import { getVisibleText } from '../../lib/text/getVisibleText';
import { readSignupOrigin } from '../../lib/signupOrigin';
import styles from '../../styles/auth.module.css';

interface Props {
  readonly setErrorMessage: ErrorHandlerType;
  readonly redirect?: string | null;
}

const MIN_PASSWORD_LENGTH = 8;

function RegisterForm({ setErrorMessage, redirect }: Props) {
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [tos, setTos] = useState(localStorage.getItem('tos') === 'true');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const signupOrigin = useMemo(
    () =>
      readSignupOrigin(
        globalThis.location?.search ?? '',
        globalThis.sessionStorage ?? null
      ),
    []
  );

  const passwordTouched = password.length > 0;
  const passwordMeetsMinimum = password.length >= MIN_PASSWORD_LENGTH;

  const isValid = () =>
    tos &&
    email.length > 0 &&
    email.length < 256 &&
    passwordMeetsMinimum &&
    password.length < 256;

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const res = await get2ankiApi().register('', email, password, signupOrigin);
      if (res.status === 200) {
        const loginUrl = redirect
          ? `/login?redirect=${encodeURIComponent(redirect)}`
          : '/login';
        globalThis.location.href = loginUrl;
      } else {
        const body = await res.json().catch(() => null);
        const backendMessage = body?.message;
        setErrorMessage(
          backendMessage ??
            'Something went wrong on our end. Try again, or email support@2anki.net if it keeps happening.'
        );
        setLoading(false);
      }
    } catch (error) {
      console.error('Register submit failed', error);
      setErrorMessage(
        "Couldn't create your account. If you already have one, log in instead."
      );
      setLoading(false);
    }
  };

  const passwordHelpClass = (() => {
    if (passwordTouched) {
      return passwordMeetsMinimum ? styles.helpSuccess : styles.helpDanger;
    }
    return styles.helpMuted;
  })();

  const passwordHelpText = (() => {
    if (passwordMeetsMinimum) {
      return '✓ Good';
    }
    return 'Use at least 8 characters.';
  })();

  return (
    <div className={styles.formPage}>
      <div className={styles.formCard}>
        <TopMessage />
        <h1 className={styles.formTitle}>
          {getVisibleText('navigation.register.title')}
        </h1>
        <WithGoogleLink text={getVisibleText('navigation.register.google')} />
        <div className={styles.divider}>
          <span className={styles.dividerLabel}>or sign up with email</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="email">
              <span>Email</span>
              <input
                id="email"
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
                name="email"
              />
            </label>
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
                aria-describedby="password-help"
              />
            </label>
            <p id="password-help" className={passwordHelpClass}>
              {passwordHelpText}
            </p>
          </div>
          <div className={styles.field}>
            <label htmlFor="tos" className={styles.checkbox}>
              <input
                id="tos"
                name="tos"
                required
                type="checkbox"
                checked={tos}
                onChange={(event) => {
                  setTos(event.target.checked);
                  localStorage.setItem('tos', event.target.checked.toString());
                }}
              />
              <span>
                I agree to the{' '}
                <a
                  rel="noreferrer"
                  target="_blank"
                  href="https://alemayhu.notion.site/Terms-of-services-931865161517453b99fb6495e400061d"
                >
                  terms of service
                </a>{' '}
                and have read the{' '}
                <a
                  rel="noreferrer"
                  target="_blank"
                  href="https://alemayhu.notion.site/Privacy-38c6e8238ac04ea9b2485bf488909fd0"
                >
                  privacy policy
                </a>
                .
              </span>
            </label>
          </div>
          <div className={styles.field}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={!isValid() || loading}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </div>
        </form>
        <p className={styles.footerText}>
          {getVisibleText('navigation.login.question')}{' '}
          <a rel="noreferrer" href="/login">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}

export default RegisterForm;
