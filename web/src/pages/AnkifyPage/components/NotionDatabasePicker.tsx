import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import sharedStyles from '../../../styles/shared.module.css';
import styles from '../AnkifyPage.module.css';
import { Backend } from '../../../lib/backend/Backend';
import NotionPagePicker from './NotionPagePicker';

interface Props {
  readonly backend: Backend;
  readonly value: string;
  readonly onChange: (databaseId: string) => void;
}

const DATABASES_KEY = ['ankify-notion-databases'];

export default function NotionDatabasePicker({
  backend,
  value,
  onChange,
}: Props) {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedInput, setAdvancedInput] = useState('');

  const databases = useQuery({
    queryKey: DATABASES_KEY,
    queryFn: () => backend.listAnkifyNotionDatabases(),
  });

  const create = useMutation({
    mutationFn: (parentPageId: string) =>
      backend.createAnkifyReviewTracker({ parentPageId }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: DATABASES_KEY });
      onChange(created.id);
      setShowCreate(false);
    },
  });

  const handleAdvanced = (event: React.FormEvent) => {
    event.preventDefault();
    if (advancedInput.trim().length === 0) return;
    onChange(advancedInput.trim());
    setShowAdvanced(false);
    setAdvancedInput('');
  };

  const databasesList = databases.data ?? [];
  const selected = databasesList.find((d) => d.id === value);
  const noDatabases =
    databases.isFetched && !databases.isError && databasesList.length === 0;

  return (
    <div>
      <label htmlFor="ankify-notion-database">Notion database</label>
      <select
        id="ankify-notion-database"
        value={value}
        onChange={(event) => {
          const next = event.target.value;
          if (next === '__create__') {
            setShowCreate(true);
            return;
          }
          onChange(next);
        }}
        disabled={databases.isLoading}
      >
        <option value="">
          {databases.isLoading
            ? 'Loading your Notion databases…'
            : 'Pick a database…'}
        </option>
        <option value="__create__">+ Create a new tracker for me</option>
        {databasesList.length > 0 && (
          <optgroup label="Your Notion databases">
            {databasesList.map((db) => (
              <option key={db.id} value={db.id}>
                {db.title}
                {db.has_review_shape ? ' · ready' : ''}
              </option>
            ))}
          </optgroup>
        )}
      </select>

      {selected != null && !selected.has_review_shape && (
        <p className={sharedStyles.helpDanger} style={{ marginTop: '0.4rem' }}>
          This database doesn't have <code>Date</code> and{' '}
          <code>Reviews</code> properties yet — sending will fail until you
          add them, or pick "Create a new tracker for me".
        </p>
      )}

      {noDatabases && (
        <p className={styles.muted} style={{ marginTop: '0.4rem' }}>
          No Notion databases shared with 2anki yet. In Notion, open a
          database and choose <strong>… → Add connections → 2anki</strong>,
          or pick <strong>+ Create a new tracker for me</strong> above and
          we'll make one in a page you choose.
        </p>
      )}

      {databases.isError && (
        <p role="alert" className={sharedStyles.helpDanger} style={{ marginTop: '0.4rem' }}>
          Couldn't load your Notion databases:{' '}
          {(databases.error as Error).message}
        </p>
      )}

      {value.length > 0 && selected == null && databases.isFetched && (
        <p className={styles.muted} style={{ marginTop: '0.4rem' }}>
          Saved database isn't in your current Notion list. It still works,
          but you may want to re-share it with 2anki.
        </p>
      )}

      {showCreate && (
        <div className={styles.scheduleCard} style={{ marginTop: '0.6rem' }}>
          <p className={styles.sectionDescription} style={{ marginTop: 0 }}>
            Pick a Notion page to put the new tracker under. We'll create a
            database called "Anki review tracker" with Date and Reviews
            already set up.
          </p>
          <NotionPagePicker
            backend={backend}
            onSelect={(pageId) => create.mutate(pageId)}
            busyId={create.isPending ? null : null}
            disabledIds={new Set()}
            selectLabel="Create tracker here"
            busyLabel="Creating…"
            subscribedLabel=""
          />
          {create.isError && (
            <p role="alert" className={sharedStyles.helpDanger}>
              {(create.error as Error).message}
            </p>
          )}
          <button
            type="button"
            className={`${sharedStyles.btnSmall} ${styles.inlineButton}`}
            onClick={() => setShowCreate(false)}
            style={{ marginTop: '0.4rem' }}
          >
            Cancel
          </button>
        </div>
      )}

      <details
        className={styles.advancedDetails}
        open={showAdvanced}
        onToggle={(event) =>
          setShowAdvanced((event.target as HTMLDetailsElement).open)
        }
        style={{ marginTop: '0.4rem' }}
      >
        <summary className={styles.advancedSummary}>
          Don't see your database? Paste an ID instead.
        </summary>
        <form onSubmit={handleAdvanced} className={styles.advancedBody}>
          <label htmlFor="ankify-database-advanced">Notion database ID</label>
          <div className={styles.advancedRow}>
            <input
              id="ankify-database-advanced"
              type="text"
              value={advancedInput}
              onChange={(event) => setAdvancedInput(event.target.value)}
              placeholder="Paste from your Notion database URL"
            />
            <button
              type="submit"
              className={`${sharedStyles.btnSecondary} ${styles.inlineButton}`}
              disabled={advancedInput.trim().length === 0}
            >
              Use this database
            </button>
          </div>
        </form>
      </details>
    </div>
  );
}
