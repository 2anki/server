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
  const scheduleEnabled = scheduleQuery.data?.enabled === true;

  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Send your reviews to Notion</h2>
      </header>
      <p className={styles.sectionDescription}>
        Each day's review count gets written as a row in a Notion database.
        Existing days are kept — only new ones are added. Your database needs a{' '}
        <code>Date</code> property and a <code>Reviews</code> property.
      </p>

      <div className={styles.exportCard}>
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
              placeholder="Paste from your Notion database URL"
            />
          </div>

          <div>
            <label htmlFor="ankify-date-range">
              How many days back? (optional)
            </label>
            <input
              id="ankify-date-range"
              type="number"
              min={1}
              value={dateRangeDays}
              onChange={(event) => setDateRangeDays(event.target.value)}
              placeholder="All time"
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
              {exportMutation.isPending ? 'Sending…' : 'Send now'}
            </button>
          </div>

          {exportMutation.isSuccess && (
            <p className={sharedStyles.helpSuccess}>
              Sent {exportMutation.data.exported} new{' '}
              {exportMutation.data.exported === 1 ? 'day' : 'days'}
              {exportMutation.data.skipped > 0
                ? `, skipped ${exportMutation.data.skipped} already in Notion`
                : ''}
              {exportMutation.data.errors.length > 0
                ? `, ${exportMutation.data.errors.length} couldn't be sent`
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
      </div>

      <div className={styles.scheduleCard}>
        <div className={styles.scheduleHeading}>
          <h3 className={styles.scheduleTitle}>Send every day, automatically</h3>
          {hasSchedule && (
            <span
              className={
                scheduleEnabled
                  ? styles.scheduleStatusOn
                  : styles.scheduleStatus
              }
            >
              {scheduleEnabled ? 'On' : 'Off'}
            </span>
          )}
        </div>
        <p className={styles.sectionDescription}>
          {hasSchedule
            ? 'Runs at the time you choose, every day.'
            : "Set a time and we'll send the previous day's reviews to Notion automatically."}
          {scheduleQuery.data?.last_run_at && (
            <> Last run: {scheduleQuery.data.last_run_at}.</>
          )}
        </p>
        <div className={styles.scheduleRow}>
          <div className={styles.scheduleField}>
            <label htmlFor="ankify-schedule-time">Time of day</label>
            <input
              id="ankify-schedule-time"
              type="time"
              value={scheduleTime}
              onChange={(event) => setScheduleTime(event.target.value)}
            />
          </div>
          <div className={styles.scheduleField}>
            <label htmlFor="ankify-schedule-tz">Timezone</label>
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
              : scheduleEnabled
                ? 'Update schedule'
                : 'Turn on daily sending'}
          </button>
          {hasSchedule && (
            <button
              type="button"
              className={`${sharedStyles.btnSecondary} ${styles.inlineButton}`}
              onClick={() => deleteSchedule.mutate()}
              disabled={deleteSchedule.isPending}
            >
              {deleteSchedule.isPending ? 'Turning off…' : 'Turn off'}
            </button>
          )}
        </div>
        {saveSchedule.isError && (
          <p role="alert" className={sharedStyles.helpDanger}>
            {(saveSchedule.error as Error).message}
          </p>
        )}
      </div>
    </section>
  );
}
