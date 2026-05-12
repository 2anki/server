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
          The simplest way to turn your notes into beautiful Anki decks.
          Drop a file or connect Notion — your cards are ready in seconds.
        </HeroText>
      </div>
    </div>
  );
}

export default HeroSection;
