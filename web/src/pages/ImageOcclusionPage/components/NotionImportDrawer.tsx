import { useEffect, useRef, useState } from 'react';
import { get2ankiApi } from '../../../lib/backend/get2ankiApi';
import NotionObject from '../../../lib/interfaces/NotionObject';
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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImport: (blockIds: string[]) => Promise<void>;
  isPaying: boolean;
  currentCount: number;
}

const FREE_TIER_LIMIT = 3;
const DEBOUNCE_MS = 350;

function getBlockImageUrl(block: NotionBlock): string | null {
  if (block.type !== 'image' || block.image == null) return null;
  if (block.image.type === 'file') return block.image.file?.url ?? null;
  if (block.image.type === 'external') return block.image.external?.url ?? null;
  return null;
}

function getBlockCaption(block: NotionBlock): string {
  return block.image?.caption?.map((c) => c.plain_text).join('') ?? '';
}

export function NotionImportDrawer({ isOpen, onClose, onImport, isPaying, currentCount }: Readonly<Props>) {
  const [query, setQuery] = useState('');
  const [pages, setPages] = useState<NotionObject[]>([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [pagesError, setPagesError] = useState<string | null>(null);

  const [selectedPage, setSelectedPage] = useState<NotionObject | null>(null);
  const [blocks, setBlocks] = useState<NotionBlock[]>([]);
  const [blocksLoading, setBlocksLoading] = useState(false);
  const [blocksError, setBlocksError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const freeSlotsLeft = isPaying ? Infinity : Math.max(0, FREE_TIER_LIMIT - currentCount);
  const maxSelect = isPaying ? selected.size + 999 : freeSlotsLeft;

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setPages([]);
      setPagesError(null);
      setSelectedPage(null);
      setBlocks([]);
      setSelected(new Set());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setPagesLoading(true);
    setPagesError(null);
    const timer = setTimeout(() => {
      get2ankiApi()
        .searchTopLevelPages(query)
        .then((data) => {
          if (cancelled) return;
          setPages(data);
          setPagesLoading(false);
        })
        .catch((err: Error) => {
          if (cancelled) return;
          setPagesError(err.message);
          setPagesLoading(false);
        });
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, isOpen]);

  const handleSelectPage = (page: NotionObject) => {
    setSelectedPage(page);
    setBlocks([]);
    setBlocksError(null);
    setSelected(new Set());
    setBlocksLoading(true);
    fetch(`/api/notion/blocks/${page.id}`, { credentials: 'include' })
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json() as Promise<NotionBlock[]>;
      })
      .then((data) => {
        setBlocks(Array.isArray(data) ? data.filter((b) => b.type === 'image') : []);
        setBlocksLoading(false);
      })
      .catch((err: Error) => {
        setBlocksError(err.message);
        setBlocksLoading(false);
      });
  };

  const toggleBlock = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < maxSelect) {
        next.add(id);
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

  if (!isOpen) return null;

  const addLabel = selected.size === 0
    ? 'Select images above'
    : `Add ${selected.size} ${selected.size === 1 ? 'image' : 'images'}`;

  return (
    <div className={styles.drawer} role="dialog" aria-modal="true" aria-label="Import from Notion">
      <div className={styles.drawerHeader}>
        {selectedPage == null ? (
          <span className={styles.drawerTitle}>Import from Notion</span>
        ) : (
          <>
            <button type="button" className={styles.drawerBackBtn} onClick={() => { setSelectedPage(null); setBlocks([]); setSelected(new Set()); }}>
              ← Back to pages
            </button>
            <span className={styles.drawerPageTitle}>{selectedPage.title}</span>
          </>
        )}
        <button type="button" className={styles.drawerCloseBtn} onClick={onClose} aria-label="Close">×</button>
      </div>

      <div className={styles.drawerBody}>
        {selectedPage == null ? (
          <div className={styles.drawerPickerView}>
            <label htmlFor="notion-drawer-search" className={styles.drawerLabel}>
              Search your Notion pages
            </label>
            <input
              id="notion-drawer-search"
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a page name"
              className={styles.drawerSearchInput}
            />
            {pagesLoading && <p className={styles.drawerStatus}>Looking up your pages…</p>}
            {pagesError != null && (
              <p className={styles.drawerError}>
                We couldn't reach Notion just now.{' '}
                <button type="button" className={styles.drawerRetryBtn} onClick={() => setQuery((q) => q)}>
                  Try again
                </button>
              </p>
            )}
            {!pagesLoading && pagesError == null && pages.length === 0 && query.trim().length > 0 && (
              <p className={styles.drawerStatus}>
                No pages match "{query}". Make sure the page is shared with 2anki.
              </p>
            )}
            <ul className={styles.drawerPageList}>
              {pages.map((page) => (
                <li key={page.id}>
                  <button
                    type="button"
                    className={styles.drawerPageItem}
                    onClick={() => handleSelectPage(page)}
                  >
                    <span className={styles.drawerPageTitle}>{page.title}</span>
                    <span className={styles.drawerOpenLabel}>Open</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className={styles.drawerGalleryView}>
            {blocksLoading && (
              <p className={styles.drawerStatus}>Loading images from "{selectedPage.title}"…</p>
            )}
            {blocksError != null && (
              <p className={styles.drawerError}>
                We couldn't reach Notion just now.{' '}
                <button type="button" className={styles.drawerRetryBtn} onClick={() => handleSelectPage(selectedPage)}>
                  Try again
                </button>
              </p>
            )}
            {!blocksLoading && blocksError == null && blocks.length === 0 && (
              <div className={styles.drawerEmpty}>
                <p>No images on this page yet.</p>
                <p>We only see images that live directly on the page — not links to outside files.</p>
                <button type="button" className={styles.drawerRetryBtn} onClick={() => { setSelectedPage(null); setBlocks([]); }}>
                  ← Pick a different page
                </button>
              </div>
            )}
            {!isPaying && freeSlotsLeft === 0 && (
              <p className={styles.drawerFreeTierNote}>
                You're on the free plan — 3 images already added.{' '}
                <a href="/pricing" className={styles.drawerUpgradeLink}>Upgrade for unlimited</a>
              </p>
            )}
            <div className={styles.galleryGrid}>
              {blocks.map((block) => {
                const imgUrl = getBlockImageUrl(block);
                if (imgUrl == null) return null;
                const caption = getBlockCaption(block);
                const isSelected = selected.has(block.id);
                const atLimit = !isPaying && !isSelected && selected.size >= freeSlotsLeft;
                return (
                  <button
                    key={block.id}
                    type="button"
                    className={`${styles.galleryTile} ${isSelected ? styles.galleryTileSelected : ''}`}
                    onClick={() => !atLimit && toggleBlock(block.id)}
                    disabled={atLimit && !isSelected}
                    aria-pressed={isSelected}
                    title={caption || undefined}
                  >
                    <img src={imgUrl} alt={caption || 'Notion image'} className={styles.galleryTileImg} />
                    {isSelected && <span className={styles.galleryCheckBadge}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {selectedPage != null && (
        <div className={styles.drawerFooter}>
          <button
            type="button"
            className={styles.drawerImportBtn}
            onClick={handleImport}
            disabled={selected.size === 0 || importing}
          >
            {importing ? 'Importing…' : addLabel}
          </button>
          <button type="button" className={styles.drawerCancelBtn} onClick={onClose}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
