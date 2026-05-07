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

  const subscribe = useMutation({
    mutationFn: (notionPageId: string) =>
      api.subscribeAnkifyNotionPage(notionPageId),
    onSettled: () => {
      setPendingId(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEY });
      setAdvancedInput('');
    },
  });

  const unsubscribe = useMutation({
    mutationFn: (id: number) => api.deleteAnkifySubscription(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEY }),
  });

  const handlePick = (id: string) => {
    setPendingId(id);
    subscribe.mutate(id);
  };

  const handleAdvancedSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (advancedInput.trim().length === 0) return;
    const id = extractNotionId(advancedInput);
    setPendingId(id);
    subscribe.mutate(id);
  };

  const subscriptions = subs.data ?? [];
  const subscribedIds = new Set(
    subscriptions.map((sub) => normalizeId(sub.notion_page_id))
  );

  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Notion pages syncing into Anki</h2>
      </header>
      <p className={styles.sectionDescription}>
        Pick a Notion page and we'll keep its toggle blocks in sync with your
        hosted Anki. Updates are checked every few minutes.
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
        <p className={sharedStyles.helpSuccess}>
          Synced. {subscribe.data.created} new card
          {subscribe.data.created === 1 ? '' : 's'}, {subscribe.data.updated}{' '}
          updated
          {subscribe.data.conflicts > 0
            ? `, ${subscribe.data.conflicts} need a decision`
            : ''}
          .
        </p>
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
          <thead>
            <tr>
              <th>Notion page</th>
              <th>Last synced</th>
              <th>Last issue</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub.id}>
                <td>
                  <span
                    className={styles.mono}
                    title={sub.notion_page_id}
                  >
                    {sub.notion_page_id.slice(0, 8)}…
                  </span>
                </td>
                <td className={styles.relativeTime}>
                  {sub.last_synced_at ?? (
                    <span className={styles.muted}>Not yet</span>
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
            ))}
          </tbody>
        </table>
      ) : (
        <p className={styles.emptyLine}>
          No pages syncing yet. Pick one above to get started.
        </p>
      )}
    </section>
  );
}
