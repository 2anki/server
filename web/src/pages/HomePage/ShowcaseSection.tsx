import { useShowcase } from './useShowcase';
import { ShowcaseBlock } from '../../lib/backend/getShowcase';
import { CardFrame } from '../PreviewApkgPage/CardFrame';
import styles from './ShowcaseSection.module.css';

function NotionBlock({ block, defaultOpen }: { block: ShowcaseBlock; defaultOpen?: boolean }) {
  if (block.canExpand && block.summaryHtml) {
    return (
      <details className={styles.toggle} open={defaultOpen}>
        <summary
          className={styles.toggleSummary}
          dangerouslySetInnerHTML={{ __html: block.summaryHtml }}
        />
        {block.childrenHtml && (
          <div
            className={styles.toggleContent}
            dangerouslySetInnerHTML={{ __html: block.childrenHtml }}
          />
        )}
      </details>
    );
  }

  const html = block.html || block.summaryHtml;
  if (!html) return null;

  return (
    <div
      className={styles.notionBlock}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

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
              {data.notionBlocks.map((block, index) => (
                <NotionBlock
                  key={block.id}
                  block={block}
                  defaultOpen={index === 0}
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
