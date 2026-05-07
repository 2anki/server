import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import sharedStyles from '../../../styles/shared.module.css';
import { get2ankiApi } from '../../../lib/backend/get2ankiApi';
import { Backend } from '../../../lib/backend/Backend';

interface Props {
  readonly backend?: Backend;
}

const CONFLICTS_KEY = ['ankify-conflicts'];

export default function SyncConflicts({ backend }: Props) {
  const api = backend ?? get2ankiApi();
  const queryClient = useQueryClient();

  const conflicts = useQuery({
    queryKey: CONFLICTS_KEY,
    queryFn: () => api.listAnkifyConflicts(),
    refetchInterval: 30_000,
  });

  const resolve = useMutation({
    mutationFn: ({
      id,
      resolution,
    }: {
      id: number;
      resolution: 'keep_notion' | 'keep_anki' | 'dismissed';
    }) => api.resolveAnkifyConflict(id, resolution),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONFLICTS_KEY }),
  });

  const items = conflicts.data ?? [];
  if (items.length === 0) {
    return null;
  }

  return (
    <section style={{ marginTop: '2.5rem' }}>
      <h2 style={{ color: '#c0392b', marginBottom: '0.4rem' }}>
        Sync conflicts ({items.length})
      </h2>
      <p style={{ marginTop: 0, color: '#555' }}>
        Both Notion and Anki edited these cards since the last sync. Pick which
        side to keep, or dismiss to leave both alone (the conflict will reappear
        if either side changes again).
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {items.map((conflict) => (
          <article
            key={conflict.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '0.4rem',
              padding: '0.75rem 1rem',
            }}
          >
            <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>
              Notion block <code>{conflict.source_id.slice(0, 8)}</code> ↔ Anki
              note {conflict.anki_note_id}
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.6rem',
                marginTop: '0.6rem',
              }}
            >
              <div>
                <h4 style={{ margin: 0 }}>Notion</h4>
                <p style={{ margin: '0.2rem 0', fontWeight: 600 }}>
                  {conflict.notion_snapshot?.front ?? ''}
                </p>
                <p style={{ margin: 0, color: '#555' }}>
                  {conflict.notion_snapshot?.back ?? ''}
                </p>
              </div>
              <div>
                <h4 style={{ margin: 0 }}>Anki</h4>
                <p style={{ margin: '0.2rem 0', fontWeight: 600 }}>
                  {conflict.anki_snapshot?.front ?? ''}
                </p>
                <p style={{ margin: 0, color: '#555' }}>
                  {conflict.anki_snapshot?.back ?? ''}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem' }}>
              <button
                type="button"
                className={sharedStyles.btnPrimary}
                onClick={() =>
                  resolve.mutate({ id: conflict.id, resolution: 'keep_notion' })
                }
                disabled={resolve.isPending}
              >
                Keep Notion
              </button>
              <button
                type="button"
                className={sharedStyles.btnSecondary}
                onClick={() =>
                  resolve.mutate({ id: conflict.id, resolution: 'keep_anki' })
                }
                disabled={resolve.isPending}
              >
                Keep Anki
              </button>
              <button
                type="button"
                onClick={() =>
                  resolve.mutate({ id: conflict.id, resolution: 'dismissed' })
                }
                disabled={resolve.isPending}
                style={{
                  background: 'none',
                  border: '1px solid #ccc',
                  borderRadius: '0.3rem',
                  padding: '0.3rem 0.6rem',
                }}
              >
                Dismiss
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
