import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import sharedStyles from '../../../styles/shared.module.css';
import styles from '../AnkifyPage.module.css';
import { get2ankiApi } from '../../../lib/backend/get2ankiApi';
import { Backend } from '../../../lib/backend/Backend';
import NotionPagePicker from './NotionPagePicker';

interface Props {
  readonly backend?: Backend;
}

const SUBSCRIPTIONS_KEY = ['ankify-subscriptions'];

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

  return (
    <section className={styles.sectionFlow}>
      <div className={sharedStyles.surface}>
        <header className={sharedStyles.surfaceHeader}>
          <div className={sharedStyles.surfaceHeaderText}>
            <h2 className={sharedStyles.surfaceTitle}>
              Which pages become decks?
            </h2>
            <p className={sharedStyles.surfaceLead}>
              Pick a Notion page. It becomes a deck. Each toggle inside becomes
              a flashcard. When you edit a toggle, the flashcard updates too.
            </p>
          </div>
        </header>

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

        <hr className={sharedStyles.surfaceDivider} />

        <details>
          <summary className={styles.advancedSummary}>
            Don't see it? Paste a Notion link.
          </summary>
          <form onSubmit={handleAdvancedSubmit} className={styles.advancedBody}>
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

        {subscriptions.length > 0 ? (
          <table className={styles.subscriptionTable}>
            <caption className={styles.tableCaption}>Decks from Notion</caption>
            <thead>
              <tr>
                <th>Page</th>
                <th>Last updated</th>
                <th>Issue</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => {
                const displayTitle =
                  sub.notion_page_title?.trim().length
                    ? sub.notion_page_title
                    : 'Untitled page';
                return (
                  <tr key={sub.id}>
                    <td>
                      {sub.notion_page_url != null &&
                      sub.notion_page_url.length > 0 ? (
                        <a
                          href={sub.notion_page_url}
                          target="_blank"
                          rel="noreferrer"
                          title={`Open ${displayTitle} in Notion`}
                        >
                          {displayTitle}
                        </a>
                      ) : (
                        <span title={sub.notion_page_id}>{displayTitle}</span>
                      )}
                    </td>
                    <td className={styles.relativeTime}>
                      {subscribe.isPending &&
                      pendingId != null &&
                      normalizeId(pendingId) ===
                        normalizeId(sub.notion_page_id) ? (
                        <span aria-live="polite">Updating now…</span>
                      ) : (
                        sub.last_synced_at ?? (
                          <span className={styles.muted}>Not yet</span>
                        )
                      )}
                    </td>
                    <td className={sub.last_error ? styles.errorCell : styles.muted}>
                      {sub.last_error ?? '—'}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`${sharedStyles.btnDanger} ${styles.inlineButton}`}
                        onClick={() => unsubscribe.mutate(sub.id)}
                        disabled={unsubscribe.isPending}
                      >
                        Stop
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className={styles.emptyLine}>
            No decks yet. Pick a page above to make one.
          </p>
        )}
      </div>
    </section>
  );
}
