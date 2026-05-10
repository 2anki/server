import shared from '../styles/shared.module.css';
import styles from './Footer.module.css';

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className={`${styles.footer} ${shared.textCenter}`}>
      <div>
        <div className={shared.flexColumn}>
          <ul className={styles.links}>
            <li>
              <a href="/about">About</a>
            </li>
            <li>
              <a href="/documentation">Docs</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
            <li>
              <a href="/documentation/misc/terms-of-service">Terms</a>
            </li>
            <li>
              <a href="/documentation/misc/privacy-policy">Privacy</a>
            </li>
          </ul>
          <div>{`© 2024–${currentYear} Alexander Alemayhu`}</div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
