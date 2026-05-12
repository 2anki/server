import { useShowcase } from './useShowcase';
import { CardFrame } from '../PreviewApkgPage/CardFrame';
import styles from './ShowcaseSection.module.css';

export function ShowcaseSection() {
  const { data } = useShowcase();

  if (data == null) return null;
  if (data.notionBlocks.length === 0 && data.ankiCards.length === 0) {
    return null;
  }

  return (
    <section className={styles.showcaseSection}>
      <div className={styles.showcaseInner}>
        <p className={styles.showcaseHeading}>See it in action</p>
        <p className={styles.showcaseSubheading}>
          This Notion page becomes these Anki flashcards
        </p>
        <div className={styles.showcaseGrid}>
          <div className={styles.showcaseColumn}>
            <p className={styles.columnLabel}>Notion</p>
            <div className={styles.notionBlocks}>
              {data.notionBlocks.map((block) => (
                <div
                  key={block.id}
                  className={styles.notionBlock}
                  dangerouslySetInnerHTML={{ __html: block.html }}
                />
              ))}
            </div>
          </div>
          <div className={styles.showcaseColumn}>
            <p className={styles.columnLabel}>Anki</p>
            <div className={styles.ankiCards}>
              {data.ankiCards.map((card) => (
                <CardFrame key={card.id} card={card} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
