import { ReactNode, useEffect, useRef, useState } from 'react';
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

type Schedule = Awaited<ReturnType<Backend['getAnkifyExportSchedule']>>;

interface Props {
  readonly backend?: Backend;
  readonly schedule?: Schedule;
}

const formatScheduleTime = (
  timeOfDay: string,
  timezone: string
): string | null => {
  const match = /^(\d{2}):(\d{2})$/.exec(timeOfDay);
  if (match == null) return null;
  const targetHours = Number(match[1]);
  const targetMinutes = Number(match[2]);
  const sample = new Date();
  sample.setUTCHours(targetHours, targetMinutes, 0, 0);
  const probe = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(
    probe
      .formatToParts(sample)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value])
  );
  const seenHours = Number(parts.hour);
  const seenMinutes = Number(parts.minute);
  if (Number.isNaN(seenHours) || Number.isNaN(seenMinutes)) return null;
  const diffMinutes =
    targetHours * 60 + targetMinutes - (seenHours * 60 + seenMinutes);
  const adjusted = new Date(sample.getTime() + diffMinutes * 60_000);
  return new Intl.DateTimeFormat(undefined, {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
  }).format(adjusted);
};

const SUBSCRIPTIONS_KEY = ['ankify-subscriptions'];
const SEARCH_THRESHOLD = 10;

const extractNotionId = (input: string): string => {
  const trimmed = input.trim();
  const urlMatch =
    /([0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i.exec(
      trimmed
    );
  return urlMatch == null ? trimmed : urlMatch[1];
};

const normalizeId = (id: string): string => id.replaceAll('-', '').toLowerCase();

const renderSecondLine = (
  lastError: string | null | undefined,
  nextExportLabel: string | null
): ReactNode => {
  if (lastError != null) {
    return (
      <p className={styles.decksItemError}>
        Last check failed — we'll try again soon
      </p>
    );
  }
  if (nextExportLabel != null) {
    return (
      <p className={styles.decksItemError}>
        Next export at {nextExportLabel}
      </p>
    );
  }
  return null;
};

export default function NotionSubscriptions({ backend, schedule }: Props) {
  const api = backend ?? get2ankiApi();
  const queryClient = useQueryClient();
  const [advancedInput, setAdvancedInput] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'decks' | 'find' | null>(null);
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
      const target = event.target;
      if (
        target instanceof Node &&
        menuContainerRef.current &&
        !menuContainerRef.current.contains(target)
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

  const effectiveTab: 'decks' | 'find' =
    activeTab ?? (subscriptions.length === 0 ? 'find' : 'decks');
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
      <div role="tablist" aria-label="Decks" className={styles.tabBar}>
        <button
          type="button"
          role="tab"
          id="ankify-tab-decks"
          aria-selected={effectiveTab === 'decks'}
          aria-controls="ankify-tabpanel-decks"
          className={
            effectiveTab === 'decks'
              ? `${styles.tab} ${styles.tabActive}`
              : styles.tab
          }
          onClick={() => setActiveTab('decks')}
        >
          Decks{' '}
          {subscriptions.length > 0 && (
            <span className={styles.tabCount}>{subscriptions.length}</span>
          )}
        </button>
        <button
          type="button"
          role="tab"
          id="ankify-tab-find"
          aria-selected={effectiveTab === 'find'}
          aria-controls="ankify-tabpanel-find"
          className={
            effectiveTab === 'find'
              ? `${styles.tab} ${styles.tabActive}`
              : styles.tab
          }
          onClick={() => setActiveTab('find')}
        >
          Find pages
        </button>
      </div>

      {effectiveTab === 'find' && (
        <div
          role="tabpanel"
          id="ankify-tabpanel-find"
          aria-labelledby="ankify-tab-find"
          className={styles.tabPanel}
        >
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

      {effectiveTab === 'decks' && (
        subscriptions.length === 0 ? (
          <div
            role="tabpanel"
            id="ankify-tabpanel-decks"
            aria-labelledby="ankify-tab-decks"
            className={styles.tabPanel}
          >
            <p className={styles.emptyLine}>
              No decks yet. Switch to{' '}
              <button
                type="button"
                className={styles.inlineLinkButton}
                onClick={() => setActiveTab('find')}
              >
                Find pages
              </button>{' '}
              to add your first one.
            </p>
          </div>
        ) : (
        <div
          role="tabpanel"
          id="ankify-tabpanel-decks"
          aria-labelledby="ankify-tab-decks"
          className={styles.tabPanel}
        >
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
          <p className={styles.decksHelper}>
            Checks Notion for changes every 5 minutes.
          </p>
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
              const nextExportLabel =
                schedule?.enabled === true &&
                normalizeId(schedule.database_id) ===
                  normalizeId(sub.notion_page_id)
                  ? formatScheduleTime(schedule.time_of_day, schedule.timezone)
                  : null;
              const secondLine = renderSecondLine(
                sub.last_error,
                nextExportLabel
              );
              const relative = formatRelativeTime(sub.last_synced_at);
              const lastSyncedDisplay =
                relative == null ? (
                  <span className={styles.muted}>Not yet</span>
                ) : (
                  <span title={sub.last_synced_at ?? undefined}>
                    updated {relative}
                  </span>
                );
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
                    {secondLine}
                  </span>
                  <span className={styles.decksItemTime}>
                    {isUpdatingThisRow ? (
                      <span aria-live="polite">Updating now…</span>
                    ) : (
                      lastSyncedDisplay
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
        </div>
      ))}
    </section>
  );
}
