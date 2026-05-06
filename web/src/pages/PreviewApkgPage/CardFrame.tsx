import { useMemo, useState } from 'react';
import { ApkgPreviewCard } from '../../lib/backend/getApkgPreview';
import styles from './PreviewApkgPage.module.css';

interface CardFrameProps {
  card: ApkgPreviewCard;
}

function buildSrcDoc(card: ApkgPreviewCard, side: 'front' | 'back'): string {
  const html = side === 'front' ? card.front : card.back;
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<base target="_blank">
<style>
  html, body { margin: 0; padding: 1rem; background: #fff; color: #111; font-family: system-ui, sans-serif; }
  img, video { max-width: 100%; height: auto; }
${card.css}
</style>
</head>
<body>
<div class="card">${html}</div>
</body>
</html>`;
}

function resolveDeckSegments(card: ApkgPreviewCard): string[] {
  if (Array.isArray(card.deckPath) && card.deckPath.length > 0) {
    return card.deckPath;
  }
  if (card.deckName) return card.deckName.split('::');
  return [];
}

export function CardFrame({ card }: Readonly<CardFrameProps>) {
  const [showBack, setShowBack] = useState(false);
  const srcDoc = useMemo(
    () => buildSrcDoc(card, showBack ? 'back' : 'front'),
    [card, showBack]
  );
  const deckSegments = useMemo(() => resolveDeckSegments(card), [card]);

  return (
    <section className={styles.card}>
      <header className={styles.cardHeader}>
        <div className={styles.cardDeckPath}>
          {deckSegments.map((segment, idx) => (
            <span key={`${segment}-${idx}`} className={styles.cardDeckSegment}>
              {idx > 0 && (
                <span className={styles.cardDeckSeparator} aria-hidden="true">
                  ›
                </span>
              )}
              {segment}
            </span>
          ))}
          <span className={styles.cardDot} aria-hidden="true">
            ·
          </span>
          <span className={styles.cardTemplate}>{card.templateName}</span>
        </div>
        <button
          type="button"
          className={styles.flipButton}
          onClick={() => setShowBack((prev) => !prev)}
          aria-pressed={showBack}
        >
          {showBack ? 'Show front' : 'Show back'}
        </button>
      </header>
      <iframe
        className={styles.cardFrame}
        title={`${card.deckName} / ${card.templateName} (${
          showBack ? 'back' : 'front'
        })`}
        sandbox="allow-same-origin"
        srcDoc={srcDoc}
      />
    </section>
  );
}
