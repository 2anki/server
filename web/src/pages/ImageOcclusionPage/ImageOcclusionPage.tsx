import { useState, useCallback, useEffect, useRef } from 'react';

import { useUserLocals } from '../../lib/hooks/useUserLocals';
import { isPayingUser } from '../../components/NavigationBar/helpers/getPlanLabel';
import { ImageEntry, OcclusionRect } from './types';
import { OcclusionCanvas } from './components/OcclusionCanvas';
import { ImageQueue } from './components/ImageQueue';
import {
  saveMeta,
  loadMeta,
  hydrateEntries,
  persistNewImages,
  removePersistedImage,
  clearPersistence,
} from './hooks/useOcclusionPersistence';
import styles from '../../styles/shared.module.css';
import pageStyles from './ImageOcclusionPage.module.css';

type Mode = 'hide_all' | 'hide_one';

function buildProperFormData(
  deckName: string,
  mode: Mode,
  entries: ImageEntry[]
): FormData {
  const form = new FormData();

  const images = entries.map((entry) => ({
    imageName: entry.file.name,
    header: entry.header,
    rects: entry.rects.map((r) => ({
      x: r.x,
      y: r.y,
      w: r.w,
      h: r.h,
      label: r.label,
    })),
  }));

  form.append('data', JSON.stringify({ deckName, mode, images }));

  for (const entry of entries) {
    form.append('images', entry.file, entry.file.name);
  }

  return form;
}

export function ImageOcclusionPage() {
  const { data } = useUserLocals();
  const isPaying = isPayingUser(data?.locals);

  const [hydrated, setHydrated] = useState(false);
  const [entries, setEntries] = useState<ImageEntry[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [deckName, setDeckName] = useState('My image deck');
  const [mobileDismissed, setMobileDismissed] = useState(() =>
    typeof window !== 'undefined' && localStorage.getItem('io_mobile_dismissed') === '1'
  );

  useEffect(() => {
    if (mobileDismissed) {
      localStorage.setItem('io_mobile_dismissed', '1');
    }
  }, [mobileDismissed]);

  const [mode, setMode] = useState<Mode>('hide_all');
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const meta = loadMeta();
    if (meta == null) {
      setHydrated(true);
      return;
    }
    setDeckName(meta.deckName);
    setMode(meta.mode);
    hydrateEntries(meta).then((restored) => {
      if (restored.length > 0) setEntries(restored);
      setHydrated(true);
    });
  }, []);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveMeta(deckName, mode, entries);
    }, 500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [deckName, mode, entries, hydrated]);

  const totalCards = entries.reduce((sum, e) => sum + e.rects.length, 0);

  const handleAdd = useCallback((files: File[]) => {
    const newEntries: ImageEntry[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      header: '',
      rects: [],
      previewUrl: URL.createObjectURL(file),
    }));
    persistNewImages(newEntries);
    setEntries((prev) => {
      const next = [...prev, ...newEntries];
      setActiveIndex(next.length - 1);
      return next;
    });
  }, []);

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

  const handleRemove = useCallback((id: string) => {
    removePersistedImage(id);
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      setActiveIndex((cur) => Math.min(cur, Math.max(0, next.length - 1)));
      return next;
    });
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
      const formData = buildProperFormData(deckName, mode, entries);

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
      await clearPersistence();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!hydrated) {
    return <div className={pageStyles.pageLayout}>Restoring your session…</div>;
  }

  const activeEntry = entries[activeIndex] ?? null;

  let ctaLabel: string;
  if (isDownloading) {
    ctaLabel = 'Making your deck…';
  } else if (totalCards > 0) {
    ctaLabel = `Download deck (${totalCards} ${totalCards === 1 ? 'card' : 'cards'})`;
  } else {
    ctaLabel = 'Add an image to start';
  }

  return (
    <>
      {!mobileDismissed && (
        <div className={`${styles.notificationInfo} ${pageStyles.mobileBanner}`}>
          Drawing is easier on a larger screen.{' '}
          <button
            type="button"
            onClick={() => setMobileDismissed(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
          >
            Continue on this screen anyway
          </button>
        </div>
      )}
    <div className={pageStyles.pageLayout}>
      <div className={pageStyles.leftPanel}>
        <div className={pageStyles.panelHeader}>
          <label className={pageStyles.deckNameLabel} htmlFor="io-deck-name">Deck name</label>
          <input
            id="io-deck-name"
            type="text"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            className={pageStyles.deckNameInput}
            placeholder="My image deck"
          />
        </div>

        <ImageQueue
          entries={entries}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
          onAdd={handleAdd}
          onRemove={handleRemove}
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
              Hide all, reveal one
            </button>
            <button
              type="button"
              className={`${pageStyles.modeBtn} ${mode === 'hide_one' ? pageStyles.modeBtnActive : ''}`}
              onClick={() => setMode('hide_one')}
            >
              Hide one at a time
            </button>
          </div>

          <button
            type="button"
            className={`${styles.btnPrimary} ${styles.btnInline}`}
            onClick={handleDownload}
            disabled={isDownloading || entries.length === 0 || totalCards === 0}
          >
            {ctaLabel}
          </button>

          {error && (
            <div className={styles.notificationDanger}>
              We couldn&apos;t make your deck. {error} Please try again.
            </div>
          )}
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
            <p>Add an image from the panel on the left.</p>
            <p>Each box you draw becomes one flashcard.</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
