import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import sharedStyles from '../../../styles/shared.module.css';
import styles from '../AnkifyPage.module.css';
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
    return (
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Sync conflicts</h2>
        </header>
        <p className={styles.emptyLine}>
          No conflicts. Notion and Anki are in agreement.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.conflictBanner}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitleUrgent}>
            Sync conflicts ({items.length})
          </h2>
        </header>
        <p className={styles.sectionDescription}>
          Both Notion and Anki edited these cards since the last sync. Pick
          which side to keep, or dismiss to leave both alone (the conflict will
          reappear if either side changes again).
        </p>

        <div className={styles.conflictList}>
          {items.map((conflict) => (
            <article key={conflict.id} className={styles.conflictCard}>
              <p className={styles.conflictRef}>
                Notion block <code>{conflict.source_id.slice(0, 8)}</code> ↔
                Anki note {conflict.anki_note_id}
              </p>
              <div className={styles.conflictGrid}>
                <div className={styles.conflictPanel}>
                  <p className={styles.conflictSide}>Notion</p>
                  <p className={styles.conflictFront}>
                    {conflict.notion_snapshot?.front ?? ''}
                  </p>
                  <p className={styles.conflictBack}>
                    {conflict.notion_snapshot?.back ?? ''}
                  </p>
                </div>
                <div className={styles.conflictPanel}>
                  <p className={styles.conflictSide}>Anki</p>
                  <p className={styles.conflictFront}>
                    {conflict.anki_snapshot?.front ?? ''}
                  </p>
                  <p className={styles.conflictBack}>
                    {conflict.anki_snapshot?.back ?? ''}
                  </p>
                </div>
              </div>
              <div className={styles.conflictActions}>
                <button
                  type="button"
                  className={`${sharedStyles.btnPrimary} ${styles.inlineButton}`}
                  onClick={() =>
                    resolve.mutate({
                      id: conflict.id,
                      resolution: 'keep_notion',
                    })
                  }
                  disabled={resolve.isPending}
                >
                  Keep Notion
                </button>
                <button
                  type="button"
                  className={`${sharedStyles.btnSecondary} ${styles.inlineButton}`}
                  onClick={() =>
                    resolve.mutate({
                      id: conflict.id,
                      resolution: 'keep_anki',
                    })
                  }
                  disabled={resolve.isPending}
                >
                  Keep Anki
                </button>
                <button
                  type="button"
                  className={`${sharedStyles.btnSmall} ${styles.inlineButton}`}
                  onClick={() =>
                    resolve.mutate({
                      id: conflict.id,
                      resolution: 'dismissed',
                    })
                  }
                  disabled={resolve.isPending}
                >
                  Dismiss
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
