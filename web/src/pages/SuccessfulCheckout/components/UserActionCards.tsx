import styles from '../../../styles/shared.module.css';

const loginLink = 'https://2anki.net/login';
const registerLink = 'https://2anki.net/register';

export const UserActionCards = () => {
  return (
    <div className={styles.columns2}>
      <div>
        <h3 className={styles.sectionTitle}>Existing User</h3>
        <p>
          If you already have an account with us, simply log in using the email
          address associated with your payment.
        </p>
        <a href={loginLink} className={styles.btnPrimary}>
          Login
        </a>
        <br />
        <a href={loginLink}>{loginLink}</a> (link for reference)
      </div>

      <div>
        <h3 className={styles.sectionTitle}>New User</h3>
        <p>
          Welcome aboard! To get started, create a new account using the same
          email address used for your payment.
        </p>
        <a href={registerLink} className={styles.btnPrimary}>
          Register
        </a>
        <br />
        <a href={registerLink}>{registerLink}</a> (link for reference)
      </div>
    </div>
  );
};
