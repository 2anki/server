import shared from '../styles/shared.module.css';
import { getVisibleText } from '../lib/text/getVisibleText';
import styles from './Footer.module.css';

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className={`${styles.footer} ${shared.textCenter}`}>
      <div>
        <div className={shared.flexColumn}>
          <ul className={styles.links}>
            <li>
              <a href="/about">{getVisibleText('navigation.legal.about')}</a>
            </li>
            <li>
              <a href="/documentation">{getVisibleText('navigation.docs')}</a>
            </li>
            <li>
              <a href="/contact">{getVisibleText('navigation.contact')}</a>
            </li>
            <li>
              <a href="/documentation/misc/terms-of-service">
                {getVisibleText('navigation.legal.terms')}
              </a>
            </li>
            <li>
              <a href="/documentation/misc/privacy-policy">
                {getVisibleText('navigation.legal.privacy')}
              </a>
            </li>
          </ul>
          <div>{`© 2024–${currentYear} Alexander Alemayhu`}</div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
