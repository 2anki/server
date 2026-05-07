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
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.conflictBanner}>
        <div className={styles.conflictHeading}>
          <h2 className={styles.conflictTitle}>Decide which version to keep</h2>
          <span className={styles.conflictPill}>
            {items.length} {items.length === 1 ? 'card' : 'cards'}
          </span>
        </div>
        <p className={styles.conflictDescription}>
          You changed these in both Notion and Anki since the last sync. Pick a
          side, or dismiss to leave both alone for now.
        </p>

        <div className={styles.conflictList}>
          {items.map((conflict) => (
            <article key={conflict.id} className={styles.conflictCard}>
              <p className={styles.conflictRef}>
                Card from Notion block{' '}
                <code>{conflict.source_id.slice(0, 8)}</code>
              </p>
              <div className={styles.conflictGrid}>
                <div className={styles.conflictPanel}>
                  <p className={styles.conflictSide}>From Notion</p>
                  <p className={styles.conflictFront}>
                    {conflict.notion_snapshot?.front ?? ''}
                  </p>
                  <p className={styles.conflictBack}>
                    {conflict.notion_snapshot?.back ?? ''}
                  </p>
                </div>
                <div className={styles.conflictPanel}>
                  <p className={styles.conflictSide}>From Anki</p>
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
                  Keep Notion version
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
                  Keep Anki version
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
                  Decide later
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
