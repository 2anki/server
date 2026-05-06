import { SyntheticEvent, useState } from 'react';
import TopMessage from '../TopMessage/TopMessage';
import { ErrorHandlerType } from '../errors/helpers/getErrorMessage';
import { get2ankiApi } from '../../lib/backend/get2ankiApi';
import { WithGoogleLink } from './WithGoogleLink';
import { getVisibleText } from '../../lib/text/getVisibleText';
import styles from '../../styles/auth.module.css';
import sharedStyles from '../../styles/shared.module.css';

interface Props {
  readonly setErrorMessage: ErrorHandlerType;
  readonly redirect?: string | null;
}

function RegisterForm({ setErrorMessage, redirect }: Props) {
  const [name, setName] = useState(localStorage.getItem('name') || '');
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [tos, setTos] = useState(localStorage.getItem('tos') === 'true');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = () =>
    tos &&
    name.length > 0 &&
    name.length < 256 &&
    email.length > 0 &&
    email.length < 256 &&
    password.length > 7 &&
    password.length < 256 &&
    password === confirmPassword;

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const res = await get2ankiApi().register(name, email, password);
      if (res.status === 200) {
        const loginUrl = redirect
          ? `/login?redirect=${encodeURIComponent(redirect)}`
          : '/login';
        globalThis.location.href = loginUrl;
      } else {
        setErrorMessage(
          'Unknown error. Please try again or reach out to support@2anki.net for assistance if the issue persists.'
        );
      }
    } catch (error) {
      setErrorMessage(
        'Request failed. If you already have a user try login instead'
      );
      setLoading(false);
    }
  };
  return (
    <div className={styles.formPage}>
      <div className={styles.formCard}>
        <TopMessage />
        <h1 className={styles.formTitle}>Register</h1>
        <WithGoogleLink text={getVisibleText('navigation.register.google')} />
        <hr />
        <p className={sharedStyles.formDescription}>Or create a new account.</p>
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="name">
              <span>Name</span>
              <input
                name="name"
                min="1"
                max="255"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  localStorage.setItem('name', event.target.value);
                }}
                type="text"
                placeholder="Your name"
                required
              />
            </label>
          </div>
          <div className={styles.field}>
            <label htmlFor="email">
              <span>Email</span>
              <input
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
                name="email"
              />
            </label>
          </div>
          <div className={styles.field}>
            <label htmlFor="password">
              <span>Password (minimum 8 characters)</span>
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
            <label
              htmlFor="confirm_password"
              className={sharedStyles.marginTopSm}
            >
              <span>Confirm Password</span>
              <input
                name="confirm_password"
                min="8"
                max="255"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                type="password"
                placeholder="Confirm password"
              />
            </label>
          </div>
          <div className={styles.field}>
            <label htmlFor="tos" className={styles.checkbox}>
              <input
                name="tos"
                required
                type="checkbox"
                checked={tos}
                onChange={(event) => {
                  setTos(event.target.checked);
                  localStorage.setItem('tos', event.target.checked.toString());
                }}
              />{' '}
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
            </label>
          </div>
          <div className={styles.field}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={!isValid() || loading}
            >
              Create my account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterForm;
