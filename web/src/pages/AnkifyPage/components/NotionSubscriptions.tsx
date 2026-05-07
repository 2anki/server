import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import sharedStyles from '../../../styles/shared.module.css';
import styles from '../AnkifyPage.module.css';
import { get2ankiApi } from '../../../lib/backend/get2ankiApi';
import { Backend } from '../../../lib/backend/Backend';
import NotionPagePicker from './NotionPagePicker';
import LayersIcon from '../../../components/icons/LayersIcon';

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
      <header className={styles.sectionHead}>
        <div className={styles.sectionHeadMain}>
          <span className={styles.sectionIcon} aria-hidden="true">
            <LayersIcon width={20} height={20} />
          </span>
          <div className={styles.sectionHeadText}>
            <p className={styles.sectionEyebrowAccent}>You pick what syncs</p>
            <h2 className={styles.sectionTitleLg}>
              Choose what flows into Anki
            </h2>
          </div>
        </div>
      </header>
      <p className={styles.sectionLead}>
        You decide which Notion pages turn into Anki cards. Pick a page below
        and we'll keep its toggle blocks in step with your Anki — and push
        every change to your AnkiWeb account so your other devices stay up to
        date. Nothing syncs until you choose it.
      </p>

      <NotionPagePicker
        backend={api}
        onSelect={handlePick}
        busyId={subscribe.isPending ? pendingId : null}
        disabledIds={subscribedIds}
        selectLabel="Sync this page"
        busyLabel="Syncing…"
        subscribedLabel="Already syncing"
      />

      {subscribe.isError && (
        <p role="alert" className={sharedStyles.helpDanger}>
          {(subscribe.error as Error).message}
        </p>
      )}
      {subscribe.isSuccess && (
        <>
          <p className={sharedStyles.helpSuccess}>
            Read your Notion page. {subscribe.data.created} new card
            {subscribe.data.created === 1 ? '' : 's'},{' '}
            {subscribe.data.updated} updated in your hosted Anki
            {subscribe.data.conflicts > 0
              ? `, ${subscribe.data.conflicts} need a decision`
              : ''}
            .
            {subscribe.data.anki_web_sync === 'synced' &&
              ' Pushed to AnkiWeb.'}
            {subscribe.data.anki_web_sync === 'skipped' &&
              ' Nothing to push to AnkiWeb.'}
          </p>
          {subscribe.data.anki_web_sync === 'failed' && (
            <p className={sharedStyles.helpDanger}>
              Couldn't reach AnkiWeb. Open Anki in your browser and sign in
              to your AnkiWeb account, then try again.
            </p>
          )}
        </>
      )}

      <details className={styles.advancedDetails}>
        <summary className={styles.advancedSummary}>
          Don't see your page? Paste a Notion link instead.
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
              Sync this page
            </button>
          </div>
        </form>
      </details>

      {subscriptions.length > 0 ? (
        <table className={styles.subscriptionTable}>
          <caption className={styles.tableCaption}>
            Pages you've picked to sync
          </caption>
          <thead>
            <tr>
              <th>Your Notion page</th>
              <th>Last synced</th>
              <th>Last issue</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => {
              const displayTitle =
                sub.notion_page_title?.trim().length
                  ? sub.notion_page_title
                  : 'Untitled Notion page';
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
                    <span aria-live="polite">Syncing now…</span>
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
                    Stop syncing
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className={styles.emptyLine}>
          You haven't picked any pages yet. Choose one above and we'll start
          syncing it into your Anki.
        </p>
      )}
    </section>
  );
}
