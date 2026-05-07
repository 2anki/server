import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import sharedStyles from '../../../styles/shared.module.css';
import { get2ankiApi } from '../../../lib/backend/get2ankiApi';
import { Backend } from '../../../lib/backend/Backend';

interface Props {
  readonly backend?: Backend;
}

const SUBSCRIPTIONS_KEY = ['ankify-subscriptions'];

const extractNotionId = (input: string): string => {
  const trimmed = input.trim();
  const urlMatch = /([0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i.exec(
    trimmed
  );
  return urlMatch != null ? urlMatch[1] : trimmed;
};

export default function NotionSubscriptions({ backend }: Props) {
  const api = backend ?? get2ankiApi();
  const queryClient = useQueryClient();
  const [pageInput, setPageInput] = useState('');

  const subs = useQuery({
    queryKey: SUBSCRIPTIONS_KEY,
    queryFn: () => api.listAnkifySubscriptions(),
  });

  const subscribe = useMutation({
    mutationFn: () => api.subscribeAnkifyNotionPage(extractNotionId(pageInput)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEY });
      setPageInput('');
    },
  });

  const unsubscribe = useMutation({
    mutationFn: (id: number) => api.deleteAnkifySubscription(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEY }),
  });

  return (
    <section style={{ marginTop: '2.5rem' }}>
      <h2 style={{ marginBottom: '0.4rem' }}>Live Notion → Anki sync</h2>
      <p style={{ marginTop: 0, color: '#555' }}>
        Subscribe a Notion page and its toggle blocks will be auto-synced into
        your hosted Anki. Polling runs every 5 min; webhook fires near-real-time
        once configured in Notion.
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (pageInput.trim().length > 0) {
            subscribe.mutate();
          }
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
          maxWidth: 520,
        }}
      >
        <label>
          <div>Notion page URL or ID</div>
          <input
            type="text"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            placeholder="https://www.notion.so/... or 8a3f…"
          />
        </label>
        <div>
          <button
            type="submit"
            className={sharedStyles.btnPrimary}
            disabled={subscribe.isPending || pageInput.trim().length === 0}
          >
            {subscribe.isPending ? 'Syncing…' : 'Subscribe & sync'}
          </button>
        </div>
      </form>
      {subscribe.isError && (
        <p role="alert" style={{ color: '#c0392b', marginTop: '0.4rem' }}>
          {(subscribe.error as Error).message}
        </p>
      )}
      {subscribe.isSuccess && (
        <p style={{ color: '#15803d', marginTop: '0.4rem' }}>
          Synced ({subscribe.data.created} new, {subscribe.data.updated} updated
          {subscribe.data.conflicts > 0
            ? `, ${subscribe.data.conflicts} conflicts`
            : ''}
          ).
        </p>
      )}

      {(subs.data ?? []).length > 0 && (
        <table
          style={{
            width: '100%',
            marginTop: '1rem',
            borderCollapse: 'collapse',
          }}
        >
          <thead>
            <tr>
              <th align="left">Notion page</th>
              <th align="left">Last synced</th>
              <th align="left">Last error</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(subs.data ?? []).map((sub) => (
              <tr key={sub.id}>
                <td style={{ fontFamily: 'monospace' }}>
                  {sub.notion_page_id}
                </td>
                <td>{sub.last_synced_at ?? '—'}</td>
                <td style={{ color: sub.last_error ? '#c0392b' : '#555' }}>
                  {sub.last_error ?? '—'}
                </td>
                <td>
                  <button
                    type="button"
                    className={sharedStyles.btnDanger}
                    onClick={() => unsubscribe.mutate(sub.id)}
                    disabled={unsubscribe.isPending}
                  >
                    Unsubscribe
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
