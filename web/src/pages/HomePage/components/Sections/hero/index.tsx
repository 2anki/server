import HeroText from './HeroText';
import shared from '../../../../../styles/shared.module.css';
import styles from './Hero.module.css';

function HeroSection() {
  return (
    <div className={shared.heroSection}>
      <div className={shared.heroInner}>
        <h1 className={styles.heroTitleContainer}>
          <span className={styles.heroTitle}>
            Create{' '}
            <span className={`${styles.heroTitle} ${styles.heroSubtitle}`}>
              Anki flashcards{' '}
            </span>
            <span className={`${styles.heroTitle} ${styles.heroSubtitleAlignRight}`}>
              fast
            </span>
          </span>
        </h1>
        <HeroText>
          We are making it the easiest and fastest way to create beautiful Anki
          flashcards for anyone anywhere around the world!
        </HeroText>
      </div>
    </div>
  );
}

export default HeroSection;
