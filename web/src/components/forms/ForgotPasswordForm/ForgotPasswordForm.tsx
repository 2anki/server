import { SyntheticEvent, useState } from 'react';

import { ErrorHandlerType } from '../../errors/helpers/getErrorMessage';
import { ForgotPassword } from './ForgotPassword';
import { get2ankiApi } from '../../../lib/backend/get2ankiApi';
import styles from '../../../styles/auth.module.css';
import sharedStyles from '../../../styles/shared.module.css';

interface ForgotPasswordProps {
  setError: ErrorHandlerType;
}

function ForgotPasswordForm({ setError }: ForgotPasswordProps) {
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [didReset, setDidReset] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    setLoading(true);
    setDidReset(false);

    try {
      await get2ankiApi().forgotPassword(email);
      setLoading(false);
      setDidReset(true);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };
  return (
    <div className={styles.formPage}>
      <div className={styles.formCard}>
        <h1 className={styles.formTitle}>Forgot your password?</h1>
        <p className={sharedStyles.formDescription}>
          Please enter your email below.
        </p>
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="email">
              Email
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
          <ForgotPassword didReset={didReset} loading={loading} />
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordForm;
