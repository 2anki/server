import { useRef } from 'react';
import { ImageEntry } from '../types';
import styles from '../ImageOcclusionPage.module.css';
import { Link } from 'react-router-dom';

interface Props {
  entries: ImageEntry[];
  activeIndex: number;
  onSelect: (i: number) => void;
  onAdd: (files: File[]) => void;
  onHeaderChange: (i: number, header: string) => void;
  isPaying: boolean;
}

const FREE_TIER_LIMIT = 3;

export function ImageQueue({
  entries,
  activeIndex,
  onSelect,
  onAdd,
  onHeaderChange,
  isPaying,
}: Readonly<Props>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const atLimit = !isPaying && entries.length >= FREE_TIER_LIMIT;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) {
      onAdd(files);
    }
    e.target.value = '';
  };

  return (
    <div className={styles.queue}>
      <div className={styles.queueList}>
        {entries.map((entry, i) => (
          <div
            key={entry.previewUrl}
            className={`${styles.queueItem} ${i === activeIndex ? styles.queueItemActive : ''}`}
          >
            <button
              type="button"
              className={styles.queueThumbBtn}
              onClick={() => onSelect(i)}
              aria-label={`Select image ${i + 1}: ${entry.file.name}`}
            >
              <img
                src={entry.previewUrl}
                alt={entry.file.name}
                className={styles.queueThumb}
              />
              {entry.rects.length > 0 && (
                <span className={styles.queueBadge}>
                  {entry.rects.length} {entry.rects.length === 1 ? 'box' : 'boxes'}
                </span>
              )}
            </button>
            <input
              type="text"
              value={entry.header}
              onChange={(e) => onHeaderChange(i, e.target.value)}
              placeholder="What's this image? (optional)"
              className={styles.headerInput}
              aria-label={`Header for image ${i + 1}`}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        className={styles.addBtn}
        onClick={() => !atLimit && fileInputRef.current?.click()}
        disabled={atLimit}
        title={atLimit ? 'Upgrade to add more images' : undefined}
        aria-disabled={atLimit}
      >
        + Add images
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      {!isPaying && (
        <div className={styles.upgradeNotice}>
          {atLimit ? (
            <>
              <p>You&apos;ve added the 3 images on the free plan.</p>
              <Link to="/pricing" className={styles.upgradeLink}>
                Upgrade to add more
              </Link>
            </>
          ) : (
            <>
              {entries.length} of 3 images on the free plan{' '}
              <Link to="/pricing" className={styles.upgradeLink}>
                Upgrade for unlimited
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
