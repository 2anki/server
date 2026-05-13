import { useState, useCallback } from 'react';

import { useUserLocals } from '../../lib/hooks/useUserLocals';
import { isPayingUser } from '../../components/NavigationBar/helpers/getPlanLabel';
import { ImageEntry, OcclusionRect } from './types';
import { OcclusionCanvas } from './components/OcclusionCanvas';
import { ImageQueue } from './components/ImageQueue';
import styles from '../../styles/shared.module.css';
import pageStyles from './ImageOcclusionPage.module.css';

type Mode = 'hide_all' | 'hide_one';

function buildProperFormData(
  deckName: string,
  mode: Mode,
  entries: ImageEntry[],
  naturalSizes: Map<string, { w: number; h: number }>
): FormData {
  const form = new FormData();

  const images = entries.map((entry) => {
    const nat = naturalSizes.get(entry.previewUrl) ?? { w: 1, h: 1 };
    return {
      imageName: entry.file.name,
      header: entry.header,
      rects: entry.rects.map((r) => ({
        x: Math.round(r.x * nat.w),
        y: Math.round(r.y * nat.h),
        w: Math.round(r.w * nat.w),
        h: Math.round(r.h * nat.h),
        imgW: nat.w,
        imgH: nat.h,
        label: r.label,
      })),
    };
  });

  form.append('data', JSON.stringify({ deckName, mode, images }));

  for (const entry of entries) {
    form.append('images', entry.file, entry.file.name);
  }

  return form;
}

export function ImageOcclusionPage() {
  const { data } = useUserLocals();
  const isPaying = isPayingUser(data?.locals);

  const [entries, setEntries] = useState<ImageEntry[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [deckName, setDeckName] = useState('Image Occlusion');
  const [mode, setMode] = useState<Mode>('hide_all');
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [naturalSizes] = useState<Map<string, { w: number; h: number }>>(
    () => new Map()
  );

  const totalCards = entries.reduce((sum, e) => sum + e.rects.length, 0);

  const handleAdd = useCallback(
    (files: File[]) => {
      const newEntries: ImageEntry[] = files.map((file) => ({
        file,
        header: '',
        rects: [],
        previewUrl: URL.createObjectURL(file),
      }));
      setEntries((prev) => {
        const next = [...prev, ...newEntries];
        setActiveIndex(next.length - 1);
        return next;
      });
    },
    []
  );

  const handleRectsChange = useCallback(
    (rects: OcclusionRect[]) => {
      setEntries((prev) =>
        prev.map((e, i) => (i === activeIndex ? { ...e, rects } : e))
      );
    },
    [activeIndex]
  );

  const handleHeaderChange = useCallback((i: number, header: string) => {
    setEntries((prev) =>
      prev.map((e, idx) => (idx === i ? { ...e, header } : e))
    );
  }, []);

  const handleDownload = async () => {
    if (entries.length === 0) {
      setError('Add at least one image first.');
      return;
    }
    if (totalCards === 0) {
      setError('Draw at least one mask on an image.');
      return;
    }

    setError(null);
    setIsDownloading(true);

    try {
      const formData = buildProperFormData(deckName, mode, entries, naturalSizes);

      const response = await fetch('/api/image-occlusion', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error((body as { message?: string }).message ?? 'Download failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${deckName}.apkg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  const activeEntry = entries[activeIndex] ?? null;

  return (
    <div className={pageStyles.pageLayout}>
      <div className={pageStyles.leftPanel}>
        <div className={pageStyles.panelHeader}>
          <input
            type="text"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            className={pageStyles.deckNameInput}
            aria-label="Deck name"
            placeholder="Deck name"
          />
        </div>

        <ImageQueue
          entries={entries}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
          onAdd={handleAdd}
          onHeaderChange={handleHeaderChange}
          isPaying={isPaying}
        />

        <div className={pageStyles.panelFooter}>
          <div className={pageStyles.modeToggle}>
            <button
              type="button"
              className={`${pageStyles.modeBtn} ${mode === 'hide_all' ? pageStyles.modeBtnActive : ''}`}
              onClick={() => setMode('hide_all')}
            >
              Hide all
            </button>
            <button
              type="button"
              className={`${pageStyles.modeBtn} ${mode === 'hide_one' ? pageStyles.modeBtnActive : ''}`}
              onClick={() => setMode('hide_one')}
            >
              Hide one
            </button>
          </div>

          {totalCards > 0 && (
            <span className={styles.badgePrimary}>{totalCards} cards</span>
          )}

          <button
            type="button"
            className={`${styles.btnPrimary} ${styles.btnInline}`}
            onClick={handleDownload}
            disabled={isDownloading || entries.length === 0}
          >
            {isDownloading ? 'Building...' : 'Download .apkg'}
          </button>

          {error && <p className={styles.helpDanger}>{error}</p>}
        </div>
      </div>

      <div className={pageStyles.rightPanel}>
        {activeEntry ? (
          <OcclusionCanvas
            entry={activeEntry}
            onRectsChange={handleRectsChange}
          />
        ) : (
          <div className={styles.emptyState}>
            <p>Add images from the panel on the left, then draw masks on them.</p>
            <p>Each masked area becomes one flashcard in your Anki deck.</p>
          </div>
        )}
      </div>
    </div>
  );
}
