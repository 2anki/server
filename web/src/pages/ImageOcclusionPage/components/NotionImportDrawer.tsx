import { useEffect, useState } from 'react';
import { get2ankiApi } from '../../../lib/backend/get2ankiApi';
import styles from '../ImageOcclusionPage.module.css';

interface NotionBlock {
  id: string;
  type: string;
  image?: {
    type: 'external' | 'file';
    external?: { url: string };
    file?: { url: string };
    caption?: Array<{ plain_text: string }>;
  };
}

interface GalleryItem {
  blockId: string;
  imageUrl: string;
  caption: string;
  pageTitle: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImport: (blockIds: string[]) => Promise<void>;
  isPaying: boolean;
  currentCount: number;
}

const FREE_TIER_LIMIT = 3;

function getBlockImageUrl(block: NotionBlock): string | null {
  if (block.type !== 'image' || block.image == null) return null;
  if (block.image.type === 'file') return block.image.file?.url ?? null;
  if (block.image.type === 'external') return block.image.external?.url ?? null;
  return null;
}

async function loadAllImages(signal: AbortSignal): Promise<GalleryItem[]> {
  const pages = await get2ankiApi().searchTopLevelPages('');
  if (signal.aborted) return [];

  const pageResults = await Promise.allSettled(
    pages.map(async (page) => {
      const res = await fetch(`/api/notion/blocks/${page.id}`, {
        credentials: 'include',
        signal,
      });
      if (!res.ok) return [];
      const blocks = (await res.json()) as NotionBlock[];
      return blocks
        .filter((b) => b.type === 'image')
        .map<GalleryItem>((b) => ({
          blockId: b.id,
          imageUrl: getBlockImageUrl(b) ?? '',
          caption: b.image?.caption?.map((c) => c.plain_text).join('') ?? '',
          pageTitle: page.title,
        }))
        .filter((item) => item.imageUrl !== '');
    })
  );

  return pageResults.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
}

export function NotionImportDrawer({
  isOpen,
  onClose,
  onImport,
  isPaying,
  currentCount,
}: Readonly<Props>) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);

  const freeSlotsLeft = isPaying ? Infinity : Math.max(0, FREE_TIER_LIMIT - currentCount);

  useEffect(() => {
    if (!isOpen) return;
    setItems([]);
    setSelected(new Set());
    setError(null);
    setLoading(true);

    const controller = new AbortController();
    loadAllImages(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setItems(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (controller.signal.aborted) return;
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [isOpen]);

  const toggleItem = (blockId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(blockId)) {
        next.delete(blockId);
      } else if (isPaying || next.size < freeSlotsLeft) {
        next.add(blockId);
      }
      return next;
    });
  };

  const handleImport = async () => {
    if (selected.size === 0) return;
    setImporting(true);
    try {
      await onImport(Array.from(selected));
      onClose();
    } finally {
      setImporting(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    const controller = new AbortController();
    loadAllImages(controller.signal)
      .then((data) => { setItems(data); setLoading(false); })
      .catch((err: Error) => { setError(err.message); setLoading(false); });
  };

  if (!isOpen) return null;

  const addLabel = selected.size === 0
    ? 'Select images below'
    : `Add ${selected.size} ${selected.size === 1 ? 'image' : 'images'}`;

  const atFreeTierCap = !isPaying && currentCount >= FREE_TIER_LIMIT;

  return (
    <div className={styles.drawer} role="dialog" aria-modal="true" aria-label="Import from Notion">
      <div className={styles.drawerHeader}>
        <span className={styles.drawerTitle}>Import from Notion</span>
        <button type="button" className={styles.drawerCloseBtn} onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      <div className={styles.drawerBody}>
        {loading && (
          <div className={styles.galleryGrid}>
            {Array.from({ length: 9 }).map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={i} className={styles.gallerySkeletonTile} aria-hidden="true" />
            ))}
          </div>
        )}

        {error != null && (
          <div className={styles.drawerEmpty}>
            <p>We couldn't reach Notion just now.</p>
            <button type="button" className={styles.drawerRetryBtn} onClick={handleRetry}>
              Try again
            </button>
          </div>
        )}

        {!loading && error == null && items.length === 0 && (
          <div className={styles.drawerEmpty}>
            <p>No images found in your shared pages.</p>
            <p>Add images directly to a Notion page and share that page with 2anki.</p>
          </div>
        )}

        {!loading && error == null && items.length > 0 && (
          <>
            {atFreeTierCap && (
              <p className={styles.drawerFreeTierNote}>
                You're on the free plan — 3 images already added.{' '}
                <a href="/pricing" className={styles.drawerUpgradeLink}>
                  Upgrade for unlimited
                </a>
              </p>
            )}
            <div className={styles.galleryGrid}>
              {items.map((item) => {
                const isSelected = selected.has(item.blockId);
                const atLimit = !isPaying && !isSelected && selected.size >= freeSlotsLeft;
                return (
                  <button
                    key={item.blockId}
                    type="button"
                    className={`${styles.galleryTile} ${isSelected ? styles.galleryTileSelected : ''}`}
                    onClick={() => !atLimit && toggleItem(item.blockId)}
                    disabled={atLimit && !isSelected}
                    aria-pressed={isSelected}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.caption || item.pageTitle}
                      className={styles.galleryTileImg}
                    />
                    {isSelected && <span className={styles.galleryCheckBadge}>✓</span>}
                    <span className={styles.galleryTileCaption} title={item.pageTitle}>
                      {item.pageTitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className={styles.drawerFooter}>
        <button
          type="button"
          className={styles.drawerImportBtn}
          onClick={handleImport}
          disabled={selected.size === 0 || importing || atFreeTierCap}
        >
          {importing ? 'Importing…' : addLabel}
        </button>
        <button type="button" className={styles.drawerCancelBtn} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
