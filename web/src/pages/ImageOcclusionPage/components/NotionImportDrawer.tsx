import { useEffect, useRef, useState } from 'react';
import { get2ankiApi } from '../../../lib/backend/get2ankiApi';
import NotionObject from '../../../lib/interfaces/NotionObject';
import { BlockIcon } from '../../SearchPage/components/BlockIcon';
import sharedStyles from '../../../styles/shared.module.css';
import styles from '../ImageOcclusionPage.module.css';

interface NotionImageBlock {
  id: string;
  type: 'image';
  image: {
    type: 'external' | 'file';
    external?: { url: string };
    file?: { url: string };
    caption?: Array<{ plain_text: string }>;
  };
}

type NotionBlock = NotionImageBlock | { id: string; type: string };

interface GalleryItem {
  blockId: string;
  imageUrl: string;
  caption: string;
}

interface PageSection {
  page: NotionObject;
  images: GalleryItem[];
  loading: boolean;
  error: { isPermission: boolean } | null;
  showAll: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImport: (blockIds: string[]) => Promise<void>;
  isPaying: boolean;
  currentCount: number;
}

const FREE_TIER_LIMIT = 3;
const PREVIEW_COUNT = 6;
const SKELETON_SECTIONS = 3;

function getImageUrl(block: NotionImageBlock): string | null {
  if (block.image.type === 'file') return block.image.file?.url ?? null;
  if (block.image.type === 'external') return block.image.external?.url ?? null;
  return null;
}

async function fetchImages(pageId: string, signal: AbortSignal): Promise<GalleryItem[]> {
  const res = await fetch(`/api/notion/blocks/${pageId}`, { credentials: 'include', signal });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const isPermission =
      res.status === 400 &&
      (body.includes('object_not_found') || body.includes('not_found') || body.includes('shared'));
    const err = new Error(body || String(res.status)) as Error & { isPermission: boolean };
    err.isPermission = isPermission;
    throw err;
  }
  const data = (await res.json()) as { results?: NotionBlock[] } | NotionBlock[];
  const blocks = Array.isArray(data) ? data : (data.results ?? []);
  const items: GalleryItem[] = [];
  for (const block of blocks) {
    if (block.type === 'image') {
      const url = getImageUrl(block as NotionImageBlock);
      if (url != null) {
        const caption =
          (block as NotionImageBlock).image.caption?.map((c) => c.plain_text).join('') ?? '';
        items.push({ blockId: block.id, imageUrl: url, caption });
      }
    }
  }
  return items;
}

export function NotionImportDrawer({
  isOpen,
  onClose,
  onImport,
  isPaying,
  currentCount,
}: Readonly<Props>) {
  const [sections, setSections] = useState<PageSection[]>([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [pagesError, setPageError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const freeSlotsLeft = isPaying ? Infinity : Math.max(0, FREE_TIER_LIMIT - currentCount);
  const atFreeTierCap = !isPaying && currentCount >= FREE_TIER_LIMIT;

  useEffect(() => {
    if (!isOpen) return;
    setSearch('');
    setSelected(new Set());
    setSections([]);
    setPageError(null);
    setPagesLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    get2ankiApi()
      .searchTopLevelPages('')
      .then((pages) => {
        if (controller.signal.aborted) return;
        setPagesLoading(false);
        setSections(pages.map((page) => ({ page, images: [], loading: true, error: null, showAll: false })));
        setTimeout(() => searchRef.current?.focus(), 50);

        for (const page of pages) {
          fetchImages(page.id, controller.signal)
            .then((images) => {
              if (controller.signal.aborted) return;
              setSections((prev) =>
                prev.map((s) => (s.page.id === page.id ? { ...s, images, loading: false } : s))
              );
            })
            .catch((err: Error & { isPermission?: boolean }) => {
              if (controller.signal.aborted) return;
              setSections((prev) =>
                prev.map((s) =>
                  s.page.id === page.id
                    ? { ...s, loading: false, error: { isPermission: err.isPermission === true } }
                    : s
                )
              );
            });
        }
      })
      .catch((err: Error) => {
        if (controller.signal.aborted) return;
        setPageError(err.message);
        setPagesLoading(false);
      });

    return () => controller.abort();
  }, [isOpen]);

  const toggleImage = (blockId: string) => {
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

  if (!isOpen) return null;

  const filteredSections = sections
    .filter((s) => s.loading || s.error != null || s.images.length > 0)
    .filter((s) =>
      search.trim() === '' || s.page.title.toLowerCase().includes(search.toLowerCase())
    );

  const addLabel = selected.size === 0
    ? 'Select images to add'
    : `Add ${selected.size} ${selected.size === 1 ? 'image' : 'images'}`;

  return (
    <div className={styles.drawer} role="dialog" aria-modal="true" aria-label="Import from Notion">
      <div className={styles.drawerHeader}>
        <span className={styles.drawerTitle}>Import from Notion</span>
        <button type="button" className={styles.drawerCloseBtn} onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      <div className={styles.drawerBody}>
        {!pagesLoading && sections.length > 0 && (
          <div className={`${sharedStyles.searchBarGroup} ${styles.drawerSearchBar}`}>
            <input
              ref={searchRef}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pages"
              aria-label="Search pages"
            />
          </div>
        )}

        {pagesError != null && (
          <div className={styles.drawerEmpty}>
            <p>Couldn't reach Notion. Try again in a moment.</p>
            <button
              type="button"
              className={styles.drawerRetryBtn}
              onClick={() => {
                setPageError(null);
                setPagesLoading(true);
                get2ankiApi()
                  .searchTopLevelPages('')
                  .then((pages) => {
                    setSections(pages.map((p) => ({ page: p, images: [], loading: true, error: null, showAll: false })));
                    setPagesLoading(false);
                  })
                  .catch((err: Error) => { setPageError(err.message); setPagesLoading(false); });
              }}
            >
              Try again
            </button>
          </div>
        )}

        {pagesLoading && (
          <div className={styles.gallerySections}>
            {Array.from({ length: SKELETON_SECTIONS }).map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={i} className={styles.gallerySection}>
                <div className={styles.gallerySectionHeaderSkeleton} aria-hidden="true" />
                <div className={styles.galleryGrid}>
                  {Array.from({ length: PREVIEW_COUNT }).map((__, j) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <div key={j} className={styles.gallerySkeletonTile} aria-hidden="true" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!pagesLoading && pagesError == null && filteredSections.length === 0 && sections.length === 0 && (
          <div className={styles.drawerEmpty}>
            <p>No pages shared with 2anki yet.</p>
            <p>Share a page in Notion, then come back here.</p>
          </div>
        )}

        {!pagesLoading && pagesError == null && filteredSections.length === 0 && sections.length > 0 && (
          <div className={styles.drawerEmpty}>
            <p>No pages match "<strong>{search}</strong>".</p>
          </div>
        )}

        {atFreeTierCap && sections.length > 0 && (
          <p className={styles.drawerFreeTierNote}>
            Free plan: 3 images already added.{' '}
            <a href="/pricing" className={styles.drawerUpgradeLink}>Upgrade for unlimited</a>
          </p>
        )}

        <div className={styles.gallerySections}>
          {filteredSections.map((section) => {
            const visible = section.showAll
              ? section.images
              : section.images.slice(0, PREVIEW_COUNT);
            const hiddenCount = section.images.length - PREVIEW_COUNT;

            return (
              <div key={section.page.id} className={styles.gallerySection}>
                <div className={styles.gallerySectionHeader}>
                  <span className={styles.gallerySectionIcon}>
                    <BlockIcon icon={section.page.icon} />
                  </span>
                  <span className={styles.gallerySectionTitle}>
                    {section.page.title || 'Untitled page'}
                  </span>
                </div>

                {section.loading && (
                  <div className={styles.galleryGrid}>
                    {Array.from({ length: PREVIEW_COUNT }).map((_, i) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <div key={i} className={styles.gallerySkeletonTile} aria-hidden="true" />
                    ))}
                  </div>
                )}

                {section.error != null && (
                  <p className={styles.gallerySectionError}>
                    {section.error.isPermission
                      ? 'Not shared with 2anki. Share this page from Notion.'
                      : "Couldn't load images."}
                  </p>
                )}

                {visible.length > 0 && (
                  <div className={styles.galleryGrid}>
                    {visible.map((item) => {
                      const isSelected = selected.has(item.blockId);
                      const atLimit = !isPaying && !isSelected && selected.size >= freeSlotsLeft;
                      return (
                        <button
                          key={item.blockId}
                          type="button"
                          className={`${styles.galleryTile} ${isSelected ? styles.galleryTileSelected : ''}`}
                          onClick={() => !atLimit && toggleImage(item.blockId)}
                          disabled={atLimit && !isSelected}
                          aria-pressed={isSelected}
                          title={item.caption || undefined}
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.caption || 'Notion image'}
                            className={styles.galleryTileImg}
                          />
                          {isSelected && <span className={styles.galleryCheckBadge}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                )}

                {!section.showAll && hiddenCount > 0 && (
                  <button
                    type="button"
                    className={styles.galleryShowMore}
                    onClick={() =>
                      setSections((prev) =>
                        prev.map((s) => (s.page.id === section.page.id ? { ...s, showAll: true } : s))
                      )
                    }
                  >
                    Show {hiddenCount} more {hiddenCount === 1 ? 'image' : 'images'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
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
