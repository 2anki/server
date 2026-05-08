import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';

import sharedStyles from '../../../styles/shared.module.css';
import styles from '../AnkifyPage.module.css';
import { get2ankiApi } from '../../../lib/backend/get2ankiApi';
import { Backend } from '../../../lib/backend/Backend';
import NotionPagePicker from './NotionPagePicker';
import DotsHorizontal from '../../../components/icons/DotsHorizontal';

const formatRelativeTime = (iso: string | null | undefined): string | null => {
  if (iso == null || iso.length === 0) return null;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  return formatDistanceToNow(parsed, { addSuffix: true });
};

interface Props {
  readonly backend?: Backend;
}

const SUBSCRIPTIONS_KEY = ['ankify-subscriptions'];
const SEARCH_THRESHOLD = 10;

const extractNotionId = (input: string): string => {
  const trimmed = input.trim();
  const urlMatch =
    /([0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i.exec(
      trimmed
    );
  return urlMatch != null ? urlMatch[1] : trimmed;
};

const normalizeId = (id: string): string => id.replaceAll('-', '').toLowerCase();

export default function NotionSubscriptions({ backend }: Props) {
  const api = backend ?? get2ankiApi();
  const queryClient = useQueryClient();
  const [advancedInput, setAdvancedInput] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState<boolean | null>(null);
  const [search, setSearch] = useState('');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuContainerRef = useRef<HTMLUListElement | null>(null);

  const subs = useQuery({
    queryKey: SUBSCRIPTIONS_KEY,
    queryFn: () => api.listAnkifySubscriptions(),
  });

  type SubscriptionRow = Awaited<
    ReturnType<typeof api.listAnkifySubscriptions>
  >[number];

  interface SubscribeArgs {
    notionPageId: string;
    notionPageTitle?: string | null;
    notionPageUrl?: string | null;
  }

  const subscribe = useMutation({
    mutationFn: (args: SubscribeArgs) =>
      api.subscribeAnkifyNotionPage({
        notionPageId: args.notionPageId,
        notionPageTitle: args.notionPageTitle,
        notionPageUrl: args.notionPageUrl,
      }),
    onMutate: async (args: SubscribeArgs) => {
      await queryClient.cancelQueries({ queryKey: SUBSCRIPTIONS_KEY });
      const previous = queryClient.getQueryData<SubscriptionRow[]>(
        SUBSCRIPTIONS_KEY
      );
      const optimisticRow: SubscriptionRow = {
        id: -Date.now(),
        notion_page_id: args.notionPageId,
        notion_page_title: args.notionPageTitle ?? null,
        notion_page_url: args.notionPageUrl ?? null,
        enabled: true,
        last_polled_at: null,
        last_synced_at: null,
        last_error: null,
      };
      const alreadyPresent = (previous ?? []).some(
        (sub) =>
          normalizeId(sub.notion_page_id) ===
          normalizeId(args.notionPageId)
      );
      if (!alreadyPresent) {
        queryClient.setQueryData<SubscriptionRow[]>(SUBSCRIPTIONS_KEY, [
          ...(previous ?? []),
          optimisticRow,
        ]);
      }
      return { previous };
    },
    onError: (_err, _args, context) => {
      if (context?.previous != null) {
        queryClient.setQueryData(SUBSCRIPTIONS_KEY, context.previous);
      }
    },
    onSettled: () => {
      setPendingId(null);
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEY });
    },
    onSuccess: () => {
      setAdvancedInput('');
    },
  });

  const unsubscribe = useMutation({
    mutationFn: (id: number) => api.deleteAnkifySubscription(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEY }),
  });

  const handlePick = (id: string, page?: { title?: string; url?: string }) => {
    setPendingId(id);
    subscribe.mutate({
      notionPageId: id,
      notionPageTitle: page?.title ?? undefined,
      notionPageUrl: page?.url ?? undefined,
    });
  };

  const handleAdvancedSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (advancedInput.trim().length === 0) return;
    const id = extractNotionId(advancedInput);
    setPendingId(id);
    subscribe.mutate({ notionPageId: id });
  };

  const subscriptions = subs.data ?? [];
  const subscribedIds = new Set(
    subscriptions.map((sub) => normalizeId(sub.notion_page_id))
  );

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target as Node)
      ) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId != null) {
      document.addEventListener('mousedown', onClick);
      return () => document.removeEventListener('mousedown', onClick);
    }
    return undefined;
  }, [openMenuId]);

  const effectivePickerOpen =
    pickerOpen ?? subscriptions.length === 0;
  const showSearch = subscriptions.length >= SEARCH_THRESHOLD;
  const filteredSubscriptions =
    search.trim().length === 0
      ? subscriptions
      : subscriptions.filter((sub) =>
          (sub.notion_page_title ?? '')
            .toLowerCase()
            .includes(search.trim().toLowerCase())
        );

  return (
    <section>
      <div className={styles.decksHeader}>
        <h2 className={styles.decksHeading}>Decks from Notion</h2>
        <button
          type="button"
          className={`${sharedStyles.btnPrimary} ${styles.inlineButton}`}
          onClick={() => setPickerOpen((open) => !(open ?? subscriptions.length === 0))}
          aria-expanded={effectivePickerOpen}
        >
          + Add a deck
        </button>
      </div>

      {effectivePickerOpen && (
        <div className={styles.addDeckDisclosure}>
          <NotionPagePicker
            backend={api}
            onSelect={handlePick}
            busyId={subscribe.isPending ? pendingId : null}
            disabledIds={subscribedIds}
            selectLabel="Make this a deck"
            busyLabel="Working…"
            subscribedLabel="Already a deck"
          />

          {subscribe.isError && (
            <p role="alert" className={sharedStyles.helpDanger}>
              {(subscribe.error as Error).message}
            </p>
          )}
          {subscribe.isSuccess && (
            <>
              <p className={sharedStyles.helpSuccess}>
                Done. {subscribe.data.created} new flashcard
                {subscribe.data.created === 1 ? '' : 's'},{' '}
                {subscribe.data.updated} updated
                {subscribe.data.conflicts > 0
                  ? `, ${subscribe.data.conflicts} need a decision`
                  : ''}
                .
              </p>
              {subscribe.data.anki_web_sync === 'failed' && (
                <p className={sharedStyles.helpDanger}>
                  Couldn't reach AnkiWeb. Open Anki, sign in, then try again.
                </p>
              )}
            </>
          )}

          <details>
            <summary className={styles.advancedSummary}>
              Can't find it? Paste a Notion link instead.
            </summary>
            <form
              onSubmit={handleAdvancedSubmit}
              className={styles.advancedBody}
            >
              <label htmlFor="ankify-advanced-input">Notion page link</label>
              <div className={styles.advancedRow}>
                <input
                  id="ankify-advanced-input"
                  type="text"
                  value={advancedInput}
                  onChange={(event) => setAdvancedInput(event.target.value)}
                  placeholder="https://www.notion.so/..."
                />
                <button
                  type="submit"
                  className={`${sharedStyles.btnSecondary} ${styles.inlineButton}`}
                  disabled={
                    subscribe.isPending || advancedInput.trim().length === 0
                  }
                >
                  Make this a deck
                </button>
              </div>
            </form>
          </details>
        </div>
      )}

      {subscriptions.length === 0 ? (
        <p className={styles.emptyLine}>
          No decks yet. Pick a page above to make one.
        </p>
      ) : (
        <>
          {showSearch && (
            <div className={styles.searchAbove}>
              <input
                type="search"
                placeholder="Search your decks"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          )}
          <ul className={styles.decksList} ref={menuContainerRef}>
            {filteredSubscriptions.map((sub) => {
              const displayTitle =
                sub.notion_page_title?.trim().length
                  ? sub.notion_page_title
                  : 'Untitled page';
              const isUpdatingThisRow =
                subscribe.isPending &&
                pendingId != null &&
                normalizeId(pendingId) === normalizeId(sub.notion_page_id);
              const relative = formatRelativeTime(sub.last_synced_at);
              return (
                <li key={sub.id} className={styles.decksItem}>
                  <span className={styles.decksItemTitle} title={displayTitle}>
                    {sub.notion_page_url != null &&
                    sub.notion_page_url.length > 0 ? (
                      <a
                        href={sub.notion_page_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {displayTitle}
                      </a>
                    ) : (
                      displayTitle
                    )}
                    {sub.last_error != null && (
                      <p className={styles.decksItemError}>
                        Notion couldn't reach this page
                      </p>
                    )}
                  </span>
                  <span className={styles.decksItemTime}>
                    {isUpdatingThisRow ? (
                      <span aria-live="polite">Updating now…</span>
                    ) : relative != null ? (
                      <span title={sub.last_synced_at ?? undefined}>
                        updated {relative}
                      </span>
                    ) : (
                      <span className={styles.muted}>Not yet</span>
                    )}
                  </span>
                  <div className={styles.decksItemRowMenu}>
                    <button
                      type="button"
                      className={sharedStyles.btnIcon}
                      aria-label={`Options for ${displayTitle}`}
                      aria-haspopup="menu"
                      aria-expanded={openMenuId === sub.id}
                      onClick={() =>
                        setOpenMenuId((current) =>
                          current === sub.id ? null : sub.id
                        )
                      }
                    >
                      <DotsHorizontal width={16} height={16} />
                    </button>
                    {openMenuId === sub.id && (
                      <div role="menu" className={styles.decksItemMenu}>
                        <button
                          type="button"
                          role="menuitem"
                          className={styles.decksItemMenuItem}
                          onClick={() => {
                            setOpenMenuId(null);
                            unsubscribe.mutate(sub.id);
                          }}
                          disabled={unsubscribe.isPending}
                        >
                          Stop
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
