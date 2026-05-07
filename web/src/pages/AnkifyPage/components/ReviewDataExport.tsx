import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import sharedStyles from '../../../styles/shared.module.css';
import { get2ankiApi } from '../../../lib/backend/get2ankiApi';
import { Backend } from '../../../lib/backend/Backend';

interface Props {
  readonly backend?: Backend;
}

const SCHEDULE_KEY = ['ankify-export-schedule'];

export default function ReviewDataExport({ backend }: Props) {
  const api = backend ?? get2ankiApi();
  const queryClient = useQueryClient();
  const [databaseId, setDatabaseId] = useState('');
  const [dateRangeDays, setDateRangeDays] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [scheduleTz, setScheduleTz] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  );

  const scheduleQuery = useQuery({
    queryKey: SCHEDULE_KEY,
    queryFn: () => api.getAnkifyExportSchedule(),
  });

  useEffect(() => {
    if (scheduleQuery.data == null) {
      return;
    }
    setDatabaseId((current) =>
      current.length === 0 ? scheduleQuery.data!.database_id : current
    );
    setScheduleTime(scheduleQuery.data.time_of_day);
    setScheduleTz(scheduleQuery.data.timezone);
    if (scheduleQuery.data.date_range_days != null) {
      setDateRangeDays(String(scheduleQuery.data.date_range_days));
    }
  }, [scheduleQuery.data]);

  const exportMutation = useMutation({
    mutationFn: () =>
      api.exportAnkifyReviewData({
        databaseId: databaseId.trim(),
        dateRangeDays:
          dateRangeDays.trim().length > 0 ? Number(dateRangeDays) : undefined,
      }),
  });

  const saveSchedule = useMutation({
    mutationFn: (enabled: boolean) =>
      api.configureAnkifyExportSchedule({
        databaseId: databaseId.trim(),
        timeOfDay: scheduleTime,
        timezone: scheduleTz,
        dateRangeDays:
          dateRangeDays.trim().length > 0 ? Number(dateRangeDays) : null,
        enabled,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SCHEDULE_KEY }),
  });

  const deleteSchedule = useMutation({
    mutationFn: () => api.deleteAnkifyExportSchedule(),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SCHEDULE_KEY }),
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

      <fieldset
        style={{
          marginTop: '1.5rem',
          padding: '0.75rem 1rem',
          border: '1px solid #ddd',
          borderRadius: '0.4rem',
          maxWidth: 520,
        }}
      >
        <legend>Daily schedule</legend>
        <p style={{ marginTop: 0, color: '#555' }}>
          Run the export once a day at the chosen time. Survives server
          restarts.
          {scheduleQuery.data?.last_run_at && (
            <>
              {' '}Last run: {scheduleQuery.data.last_run_at}.
            </>
          )}
        </p>
        <div
          style={{
            display: 'flex',
            gap: '0.6rem',
            flexWrap: 'wrap',
            marginBottom: '0.6rem',
          }}
        >
          <label>
            <div>Time (HH:MM)</div>
            <input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
            />
          </label>
          <label>
            <div>Timezone (IANA)</div>
            <input
              type="text"
              value={scheduleTz}
              onChange={(e) => setScheduleTz(e.target.value)}
              placeholder="Europe/Oslo"
            />
          </label>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            type="button"
            className={sharedStyles.btnPrimary}
            onClick={() => saveSchedule.mutate(true)}
            disabled={
              saveSchedule.isPending || databaseId.trim().length === 0
            }
          >
            {saveSchedule.isPending
              ? 'Saving…'
              : scheduleQuery.data?.enabled
                ? 'Update schedule'
                : 'Enable daily schedule'}
          </button>
          {scheduleQuery.data != null && (
            <button
              type="button"
              className={sharedStyles.btnSecondary}
              onClick={() => deleteSchedule.mutate()}
              disabled={deleteSchedule.isPending}
            >
              {deleteSchedule.isPending ? 'Removing…' : 'Disable'}
            </button>
          )}
        </div>
        {saveSchedule.isError && (
          <p role="alert" style={{ color: '#c0392b' }}>
            {(saveSchedule.error as Error).message}
          </p>
        )}
      </fieldset>
    </section>
  );
}
