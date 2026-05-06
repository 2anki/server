import { SyntheticEvent, useState } from 'react';
import { ErrorHandlerType } from '../errors/helpers/getErrorMessage';
import { get2ankiApi } from '../../lib/backend/get2ankiApi';
import styles from '../../styles/auth.module.css';
import sharedStyles from '../../styles/shared.module.css';

interface Props {
  setErrorMessage: ErrorHandlerType;
}

function NewPasswordForm({ setErrorMessage }: Props) {
  const [password, setPassword] = useState('');
  const [passwd, setPasswd] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = () =>
    password === passwd && password.length > 0 && password.length < 256;

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const paths = window.location.pathname.split('/');
      const resetToken = paths[paths.length - 1];
      const res = await get2ankiApi().newPassword(password, resetToken);
      if (res.status === 200) {
        window.location.href = '/login#login';
      }
      setLoading(false);
    } catch (error) {
      setErrorMessage(error as Error);
      setLoading(false);
    }
  };
  return (
    <div className={styles.formPage}>
      <div className={styles.formCard}>
        <h1 className={styles.formTitle}>Change your password?</h1>
        <p className={sharedStyles.formDescription}>
          Please enter your new password below.
        </p>
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="password">
              <span>New password</span>
              <input
                min="8"
                max="255"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
                type="password"
                placeholder="New password"
                required
              />
            </label>
          </div>
          <div className={styles.field}>
            <label htmlFor="confirm_password">
              <span>Confirm new password</span>
              <input
                min="8"
                max="255"
                value={passwd}
                onChange={(event) => {
                  setPasswd(event.target.value);
                }}
                type="password"
                placeholder="Re-enter new password"
                required
              />
            </label>
          </div>
          <div className={styles.field}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={!isValid() || loading}
            >
              Reset password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewPasswordForm;
