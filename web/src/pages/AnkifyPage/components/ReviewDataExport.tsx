import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import sharedStyles from '../../../styles/shared.module.css';
import { get2ankiApi } from '../../../lib/backend/get2ankiApi';
import { Backend } from '../../../lib/backend/Backend';

interface Props {
  readonly backend?: Backend;
}

export default function ReviewDataExport({ backend }: Props) {
  const api = backend ?? get2ankiApi();
  const [databaseId, setDatabaseId] = useState('');
  const [dateRangeDays, setDateRangeDays] = useState('');

  const exportMutation = useMutation({
    mutationFn: () =>
      api.exportAnkifyReviewData({
        databaseId: databaseId.trim(),
        dateRangeDays:
          dateRangeDays.trim().length > 0 ? Number(dateRangeDays) : undefined,
      }),
  });

  return (
    <section style={{ marginTop: '2.5rem' }}>
      <h2 style={{ marginBottom: '0.4rem' }}>Export review data to Notion</h2>
      <p style={{ marginTop: 0, color: '#555' }}>
        Pulls per-day card review counts from your hosted Anki and writes one
        row per day into a Notion database. Database needs <code>Date</code>{' '}
        and <code>Reviews</code> properties. Existing dates are skipped.
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (databaseId.trim().length > 0) {
            exportMutation.mutate();
          }
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxWidth: 520 }}
      >
        <label>
          <div>Notion database ID</div>
          <input
            type="text"
            value={databaseId}
            onChange={(event) => setDatabaseId(event.target.value)}
            placeholder="e.g. 8a3f…"
            style={{
              width: '100%',
              padding: '0.4rem 0.6rem',
              border: '1px solid #ccc',
              borderRadius: '0.3rem',
            }}
          />
        </label>

        <label>
          <div>Date range (last N days, optional)</div>
          <input
            type="number"
            min={1}
            value={dateRangeDays}
            onChange={(event) => setDateRangeDays(event.target.value)}
            placeholder="all"
            style={{
              width: '100%',
              padding: '0.4rem 0.6rem',
              border: '1px solid #ccc',
              borderRadius: '0.3rem',
            }}
          />
        </label>

        <div>
          <button
            type="submit"
            className={sharedStyles.btnPrimary}
            disabled={exportMutation.isPending || databaseId.trim().length === 0}
          >
            {exportMutation.isPending ? 'Exporting…' : 'Export now'}
          </button>
        </div>

        {exportMutation.isSuccess && (
          <p style={{ color: '#15803d' }}>
            Exported {exportMutation.data.exported} new entries
            {exportMutation.data.skipped > 0
              ? `, skipped ${exportMutation.data.skipped} already-present`
              : ''}
            {exportMutation.data.errors.length > 0
              ? `, ${exportMutation.data.errors.length} errors`
              : ''}
            .
          </p>
        )}
        {exportMutation.isError && (
          <p role="alert" style={{ color: '#c0392b' }}>
            {(exportMutation.error as Error).message}
          </p>
        )}
      </form>
    </section>
  );
}
