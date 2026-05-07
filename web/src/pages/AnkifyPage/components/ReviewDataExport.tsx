import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import sharedStyles from '../../../styles/shared.module.css';
import styles from '../AnkifyPage.module.css';
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SCHEDULE_KEY }),
  });

  const deleteSchedule = useMutation({
    mutationFn: () => api.deleteAnkifyExportSchedule(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SCHEDULE_KEY }),
  });

  const hasSchedule = scheduleQuery.data != null;

  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Export review data to Notion</h2>
      </header>
      <p className={styles.sectionDescription}>
        Pulls per-day card review counts from your hosted Anki and writes one
        row per day into a Notion database. Database needs <code>Date</code>{' '}
        and <code>Reviews</code> properties. Existing dates are skipped.
      </p>

      <form
        className={styles.formGrid}
        onSubmit={(event) => {
          event.preventDefault();
          if (databaseId.trim().length > 0) {
            exportMutation.mutate();
          }
        }}
      >
        <div>
          <label htmlFor="ankify-database-id">Notion database ID</label>
          <input
            id="ankify-database-id"
            type="text"
            value={databaseId}
            onChange={(event) => setDatabaseId(event.target.value)}
            placeholder="e.g. 8a3f…"
          />
        </div>

        <div>
          <label htmlFor="ankify-date-range">
            Date range (last N days, optional)
          </label>
          <input
            id="ankify-date-range"
            type="number"
            min={1}
            value={dateRangeDays}
            onChange={(event) => setDateRangeDays(event.target.value)}
            placeholder="all"
          />
        </div>

        <div className={styles.actionRow}>
          <button
            type="submit"
            className={`${sharedStyles.btnPrimary} ${styles.inlineButton}`}
            disabled={
              exportMutation.isPending || databaseId.trim().length === 0
            }
          >
            {exportMutation.isPending ? 'Exporting…' : 'Export now'}
          </button>
        </div>

        {exportMutation.isSuccess && (
          <p className={sharedStyles.helpSuccess}>
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
          <p role="alert" className={sharedStyles.helpDanger}>
            {(exportMutation.error as Error).message}
          </p>
        )}
      </form>

      <fieldset className={styles.scheduleFieldset} style={{ marginTop: '1.5rem' }}>
        <legend>Daily schedule</legend>
        <p className={styles.sectionDescription}>
          {hasSchedule
            ? 'Runs every day at the chosen time. Survives server restarts.'
            : 'No schedule configured yet. Set a time below to run the export every day.'}
          {scheduleQuery.data?.last_run_at && (
            <> Last run: {scheduleQuery.data.last_run_at}.</>
          )}
        </p>
        <div className={styles.scheduleRow}>
          <div className={styles.scheduleField}>
            <label htmlFor="ankify-schedule-time">Time (HH:MM)</label>
            <input
              id="ankify-schedule-time"
              type="time"
              value={scheduleTime}
              onChange={(event) => setScheduleTime(event.target.value)}
            />
          </div>
          <div className={styles.scheduleField}>
            <label htmlFor="ankify-schedule-tz">Timezone (IANA)</label>
            <input
              id="ankify-schedule-tz"
              type="text"
              value={scheduleTz}
              onChange={(event) => setScheduleTz(event.target.value)}
              placeholder="Europe/Oslo"
            />
          </div>
        </div>
        <div className={styles.actionRow}>
          <button
            type="button"
            className={`${sharedStyles.btnPrimary} ${styles.inlineButton}`}
            onClick={() => saveSchedule.mutate(true)}
            disabled={saveSchedule.isPending || databaseId.trim().length === 0}
          >
            {saveSchedule.isPending
              ? 'Saving…'
              : scheduleQuery.data?.enabled
                ? 'Update schedule'
                : 'Enable daily schedule'}
          </button>
          {hasSchedule && (
            <button
              type="button"
              className={`${sharedStyles.btnSecondary} ${styles.inlineButton}`}
              onClick={() => deleteSchedule.mutate()}
              disabled={deleteSchedule.isPending}
            >
              {deleteSchedule.isPending ? 'Removing…' : 'Disable'}
            </button>
          )}
        </div>
        {saveSchedule.isError && (
          <p role="alert" className={sharedStyles.helpDanger}>
            {(saveSchedule.error as Error).message}
          </p>
        )}
      </fieldset>
    </section>
  );
}
