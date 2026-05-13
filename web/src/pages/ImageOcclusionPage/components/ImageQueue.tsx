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
                <span className={styles.queueBadge}>{entry.rects.length}</span>
              )}
            </button>
            <input
              type="text"
              value={entry.header}
              onChange={(e) => onHeaderChange(i, e.target.value)}
              placeholder="Header (optional)"
              className={styles.headerInput}
              aria-label={`Header for image ${i + 1}`}
            />
          </div>
        ))}
      </div>

      {atLimit ? (
        <div className={styles.upgradeNotice}>
          <p>Free accounts support up to 3 images.</p>
          <Link to="/pricing" className={styles.upgradeLink}>
            Upgrade for unlimited
          </Link>
        </div>
      ) : (
        <>
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => fileInputRef.current?.click()}
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
        </>
      )}
    </div>
  );
}
