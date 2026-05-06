import shared from '../styles/shared.module.css';
import styles from './Footer.module.css';

function Footer() {
  return (
    <footer className={`${styles.footer} ${shared.textCenter}`}>
      <div>
        <div className={shared.flexColumn}>
          <div>Copyright © 2024-2025 Alexander Alemayhu.</div>
          <ul className={styles.links}>
            <li>
              <a href="/about">About</a>
            </li>
            <li>
              <a href="/documentation/misc/terms-of-service">Terms</a>
            </li>
            <li>
              <a href="/documentation/misc/privacy-policy">Privacy</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
