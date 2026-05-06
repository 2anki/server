import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TopMessage from '../../../../components/TopMessage/TopMessage';
import { isValidCredentials } from './helpers/isValidCredentials';
import { useHandleLoginSubmit } from './helpers/useHandleLoginSubmit';
import { getVisibleText } from '../../../../lib/text/getVisibleText';
import { WithGoogleLink } from '../../../../components/forms/WithGoogleLink';
import styles from '../../../../styles/auth.module.css';

function LoginForm() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const { email, password, loading, onSubmit, setEmail, setPassword } =
    useHandleLoginSubmit((e) => setError((e as Error).message));

  const registerHref =
    searchParams.get('error') === 'upload_limit_exceeded'
      ? '/register?redirect=/pricing'
      : '/register';

  return (
    <div className={styles.formPage}>
      <div className={styles.formCard}>
        <TopMessage />
        <h1 className={styles.formTitle}>
          {getVisibleText('navigation.login.title')}
        </h1>
        <WithGoogleLink text={getVisibleText('navigation.login.google')} />
        <hr />
        <form onSubmit={onSubmit}>
          <div className={styles.field}>
            <label htmlFor="email">
              <span>Email</span>
              <input
                name="email"
                min="3"
                max="255"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  localStorage.setItem('email', event.target.value);
                }}
                type="email"
                placeholder="Your e-mail"
                required
              />
            </label>
          </div>
          <div className={styles.field}>
            <label htmlFor="password">
              <span>Password</span>
              <input
                name="password"
                min="8"
                max="255"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                placeholder="Your password"
              />
            </label>
          </div>
          <div className={styles.field}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={!isValidCredentials(email, password) || loading}
            >
              Log in
            </button>
            {error && <p className={styles.helpDanger}>{error}</p>}
          </div>
        </form>
        <p className={styles.footerText}>
          {getVisibleText('navigation.register.question')}{' '}
          <a rel="noreferrer" href={registerHref}>
            Register!
          </a>
        </p>
        <p className={styles.footerText}>
          <a rel="noreferrer" href="/forgot">
            I forgot my password
          </a>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
