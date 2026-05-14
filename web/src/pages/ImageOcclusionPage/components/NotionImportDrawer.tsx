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

interface NotionChildPageBlock {
  id: string;
  type: 'child_page';
  child_page: { title: string };
}

type NotionBlock = NotionImageBlock | NotionChildPageBlock | { id: string; type: string };

interface GalleryItem {
  blockId: string;
  imageUrl: string;
  caption: string;
}

interface PageEntry {
  id: string;
  title: string;
  icon?: string;
}

interface PageContents {
  images: GalleryItem[];
  subPages: PageEntry[];
}

type DrawerView =
  | { kind: 'pages' }
  | { kind: 'page'; stack: PageEntry[] };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImport: (blockIds: string[]) => Promise<void>;
  isPaying: boolean;
  currentCount: number;
}

const FREE_TIER_LIMIT = 3;
const SKELETON_COUNT = 6;

function getImageUrl(block: NotionImageBlock): string | null {
  if (block.image.type === 'file') return block.image.file?.url ?? null;
  if (block.image.type === 'external') return block.image.external?.url ?? null;
  return null;
}

async function fetchPageContents(pageId: string, signal: AbortSignal): Promise<PageContents> {
  const res = await fetch(`/api/notion/blocks/${pageId}`, { credentials: 'include', signal });
  if (!res.ok) throw new Error(`${res.status}`);
  const data = (await res.json()) as { results?: NotionBlock[] } | NotionBlock[];
  const blocks = Array.isArray(data) ? data : (data.results ?? []);

  const images: GalleryItem[] = [];
  const subPages: PageEntry[] = [];

  for (const block of blocks) {
    if (block.type === 'image') {
      const url = getImageUrl(block as NotionImageBlock);
      if (url != null) {
        const caption =
          (block as NotionImageBlock).image.caption?.map((c) => c.plain_text).join('') ?? '';
        images.push({ blockId: block.id, imageUrl: url, caption });
      }
    } else if (block.type === 'child_page') {
      const title = (block as NotionChildPageBlock).child_page.title || 'Untitled page';
      subPages.push({ id: block.id, title });
    }
  }

  return { images, subPages };
}

export function NotionImportDrawer({
  isOpen,
  onClose,
  onImport,
  isPaying,
  currentCount,
}: Readonly<Props>) {
  const [view, setView] = useState<DrawerView>({ kind: 'pages' });
  const [pages, setPages] = useState<NotionObject[]>([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [pagesError, setPagesError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [contents, setContents] = useState<PageContents | null>(null);
  const [contentsLoading, setContentsLoading] = useState(false);
  const [contentsError, setContentsError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const freeSlotsLeft = isPaying ? Infinity : Math.max(0, FREE_TIER_LIMIT - currentCount);
  const atFreeTierCap = !isPaying && currentCount >= FREE_TIER_LIMIT;

  useEffect(() => {
    if (!isOpen) return;
    setView({ kind: 'pages' });
    setSearch('');
    setContents(null);
    setContentsError(null);
    setSelected(new Set());
    setPagesLoading(true);
    setPagesError(null);
    const controller = new AbortController();
    abortRef.current = controller;
    get2ankiApi()
      .searchTopLevelPages('')
      .then((data) => {
        if (controller.signal.aborted) return;
        setPages(data);
        setPagesLoading(false);
        setTimeout(() => searchRef.current?.focus(), 50);
      })
      .catch((err: Error) => {
        if (controller.signal.aborted) return;
        setPagesError(err.message);
        setPagesLoading(false);
      });
    return () => controller.abort();
  }, [isOpen]);

  const navigateTo = (entry: PageEntry) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setView((prev) => {
      const stack = prev.kind === 'page' ? [...prev.stack, entry] : [entry];
      return { kind: 'page', stack };
    });
    setContents(null);
    setContentsError(null);
    setContentsLoading(true);

    fetchPageContents(entry.id, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setContents(data);
        setContentsLoading(false);
      })
      .catch((err: Error) => {
        if (controller.signal.aborted) return;
        setContentsError(err.message);
        setContentsLoading(false);
      });
  };

  const navigateBack = () => {
    abortRef.current?.abort();
    setView((prev) => {
      if (prev.kind !== 'page') return prev;
      if (prev.stack.length <= 1) return { kind: 'pages' };
      const stack = prev.stack.slice(0, -1);
      const parent = stack[stack.length - 1];
      const controller = new AbortController();
      abortRef.current = controller;
      setContents(null);
      setContentsError(null);
      setContentsLoading(true);
      fetchPageContents(parent.id, controller.signal)
        .then((data) => {
          if (controller.signal.aborted) return;
          setContents(data);
          setContentsLoading(false);
        })
        .catch((err: Error) => {
          if (controller.signal.aborted) return;
          setContentsError(err.message);
          setContentsLoading(false);
        });
      return { kind: 'page', stack };
    });
  };

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

  const currentPage = view.kind === 'page' ? view.stack[view.stack.length - 1] : null;
  const filteredPages = search.trim() === ''
    ? pages
    : pages.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  const addLabel = selected.size === 0
    ? 'Select images to add'
    : `Add ${selected.size} ${selected.size === 1 ? 'image' : 'images'}`;

  return (
    <div className={styles.drawer} role="dialog" aria-modal="true" aria-label="Import from Notion">
      <div className={styles.drawerHeader}>
        {view.kind === 'page' ? (
          <>
            <button type="button" className={styles.drawerBackBtn} onClick={navigateBack}>
              ← Pages
            </button>
            <span className={styles.drawerBreadcrumb} title={currentPage?.title ?? ''}>
              {currentPage?.title ?? 'Untitled page'}
            </span>
          </>
        ) : (
          <span className={styles.drawerTitle}>Import from Notion</span>
        )}
        <button type="button" className={styles.drawerCloseBtn} onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      <div className={styles.drawerBody}>
        {view.kind === 'pages' && (
          <>
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

            {pagesLoading && (
              <ul className={styles.pageList} aria-label="Loading pages">
                {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <li key={i} className={styles.pageRowSkeleton} aria-hidden="true">
                    <div className={styles.pageRowSkeletonIcon} />
                    <div className={styles.pageRowSkeletonText} />
                  </li>
                ))}
              </ul>
            )}

            {pagesError != null && (
              <div className={styles.drawerEmpty}>
                <p>Couldn't reach Notion. Try again in a moment.</p>
                <button
                  type="button"
                  className={styles.drawerRetryBtn}
                  onClick={() => {
                    setPagesError(null);
                    setPagesLoading(true);
                    get2ankiApi()
                      .searchTopLevelPages('')
                      .then((data) => { setPages(data); setPagesLoading(false); })
                      .catch((err: Error) => { setPagesError(err.message); setPagesLoading(false); });
                  }}
                >
                  Try again
                </button>
              </div>
            )}

            {!pagesLoading && pagesError == null && filteredPages.length === 0 && (
              <div className={styles.drawerEmpty}>
                {search.trim().length > 0 ? (
                  <p>No pages match "<strong>{search}</strong>".</p>
                ) : (
                  <>
                    <p>No pages shared with 2anki yet.</p>
                    <p>Share a page in Notion, then come back here.</p>
                  </>
                )}
              </div>
            )}

            {!pagesLoading && pagesError == null && filteredPages.length > 0 && (
              <ul className={styles.pageList}>
                {filteredPages.map((page) => (
                  <li key={page.id}>
                    <button
                      type="button"
                      className={styles.pageRow}
                      onClick={() => navigateTo({ id: page.id, title: page.title || 'Untitled page', icon: page.icon })}
                    >
                      <span className={styles.pageRowIcon}>
                        <BlockIcon icon={page.icon} />
                      </span>
                      <span className={styles.pageRowTitle}>{page.title || 'Untitled page'}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {view.kind === 'page' && (
          <>
            {atFreeTierCap && (
              <p className={styles.drawerFreeTierNote}>
                Free plan: 3 images already added.{' '}
                <a href="/pricing" className={styles.drawerUpgradeLink}>Upgrade for unlimited</a>
              </p>
            )}

            {contentsLoading && (
              <div className={styles.galleryGrid}>
                {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <div key={i} className={styles.gallerySkeletonTile} aria-hidden="true" />
                ))}
              </div>
            )}

            {contentsError != null && (
              <div className={styles.drawerEmpty}>
                <p>Couldn't reach Notion. Try again in a moment.</p>
                <button
                  type="button"
                  className={styles.drawerRetryBtn}
                  onClick={() => currentPage != null && navigateTo(currentPage)}
                >
                  Try again
                </button>
              </div>
            )}

            {!contentsLoading && contentsError == null && contents != null && (
              <>
                {contents.subPages.length > 0 && (
                  <div className={styles.subPageSection}>
                    <span className={styles.subPageSectionLabel}>Sub-pages</span>
                    <div className={styles.subPageChips}>
                      {contents.subPages.map((sp) => (
                        <button
                          key={sp.id}
                          type="button"
                          className={styles.subPageChip}
                          onClick={() => navigateTo(sp)}
                        >
                          {sp.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {contents.images.length === 0 && contents.subPages.length === 0 && (
                  <div className={styles.drawerEmpty}>
                    <p>No images on this page.</p>
                  </div>
                )}

                {contents.images.length === 0 && contents.subPages.length > 0 && null}

                {contents.images.length > 0 && (
                  <>
                    {contents.subPages.length > 0 && (
                      <span className={styles.subPageSectionLabel}>Images on this page</span>
                    )}
                    <div className={styles.galleryGrid}>
                      {contents.images.map((item) => {
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
                  </>
                )}
              </>
            )}
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
