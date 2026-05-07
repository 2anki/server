import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import sharedStyles from '../../../styles/shared.module.css';
import styles from '../AnkifyPage.module.css';
import { get2ankiApi } from '../../../lib/backend/get2ankiApi';
import { Backend, TrackerSchemaError } from '../../../lib/backend/Backend';
import NotionDatabasePicker from './NotionDatabasePicker';
import TrackerParentPicker from './TrackerParentPicker';
import NotionObject from '../../../lib/interfaces/NotionObject';
import SendIcon from '../../../components/icons/SendIcon';

interface Props {
  readonly backend?: Backend;
}

const SCHEDULE_KEY = ['ankify-export-schedule'];
const SUBSCRIPTIONS_KEY = ['ankify-subscriptions'];
const TRACKER_LOCAL_KEY = 'ankify-export-database-id';
const TRACKER_TITLE_LOCAL_KEY = 'ankify-export-database-title';
const TRACKER_URL_LOCAL_KEY = 'ankify-export-database-url';

type WizardStep = 'idle' | 'pickParent' | 'confirm';

const readLocal = (key: string): string => {
  try {
    return globalThis.localStorage?.getItem(key) ?? '';
  } catch {
    return '';
  }
};

const writeLocal = (key: string, value: string) => {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    /* ignore */
  }
};

export default function ReviewDataExport({ backend }: Props) {
  const api = backend ?? get2ankiApi();
  const queryClient = useQueryClient();

  const [databaseId, setDatabaseId] = useState(() =>
    readLocal(TRACKER_LOCAL_KEY)
  );
  const [trackerTitle, setTrackerTitle] = useState(() =>
    readLocal(TRACKER_TITLE_LOCAL_KEY)
  );
  const [trackerUrl, setTrackerUrl] = useState(() =>
    readLocal(TRACKER_URL_LOCAL_KEY)
  );
  const [dateRangeDays, setDateRangeDays] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [scheduleTz, setScheduleTz] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  );
  const [wizard, setWizard] = useState<WizardStep>('idle');
  const [pendingParent, setPendingParent] = useState<NotionObject | null>(null);
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [showChange, setShowChange] = useState(false);

  const scheduleQuery = useQuery({
    queryKey: SCHEDULE_KEY,
    queryFn: () => api.getAnkifyExportSchedule(),
  });

  const subsQuery = useQuery({
    queryKey: SUBSCRIPTIONS_KEY,
    queryFn: () => api.listAnkifySubscriptions(),
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

  useEffect(() => {
    if (databaseId.length > 0) {
      writeLocal(TRACKER_LOCAL_KEY, databaseId);
    }
  }, [databaseId]);

  const exportMutation = useMutation({
    mutationFn: () =>
      api.exportAnkifyReviewData({
        databaseId: databaseId.trim(),
        dateRangeDays:
          dateRangeDays.trim().length > 0 ? Number(dateRangeDays) : undefined,
      }),
    onSuccess: () => setShowAllErrors(false),
  });

  const createTracker = useMutation({
    mutationFn: (parentPageId: string) =>
      api.createAnkifyReviewTracker({ parentPageId }),
    onSuccess: (created) => {
      setDatabaseId(created.id);
      setTrackerTitle(created.title);
      setTrackerUrl(created.url ?? '');
      writeLocal(TRACKER_LOCAL_KEY, created.id);
      writeLocal(TRACKER_TITLE_LOCAL_KEY, created.title);
      writeLocal(TRACKER_URL_LOCAL_KEY, created.url ?? '');
      queryClient.invalidateQueries({ queryKey: ['ankify-notion-databases'] });
      setWizard('idle');
      setPendingParent(null);
      setShowChange(false);
    },
    onError: () => setWizard('confirm'),
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
  const hasTracker = databaseId.trim().length > 0;
  const suggestedParentId =
    subsQuery.data != null && subsQuery.data.length > 0
      ? subsQuery.data[0].notion_page_id
      : null;

  const startWizard = () => {
    setWizard('pickParent');
    setPendingParent(null);
  };

  const result = exportMutation.data;
  const errorList = result?.errors ?? [];
  const visibleErrors = showAllErrors ? errorList : errorList.slice(0, 3);
  const allFailed =
    result != null && result.totalDays > 0 && result.exported === 0;
  const looksLikeMissingProperty = errorList.some((line) =>
    /property|date|reviews|schema/i.test(line)
  );

  return (
    <section className={styles.sectionFlow}>
      <header className={styles.sectionHead}>
        <div className={styles.sectionHeadMain}>
          <span className={styles.sectionIcon} aria-hidden="true">
            <SendIcon width={20} height={20} />
          </span>
          <div className={styles.sectionHeadText}>
            <p className={styles.sectionEyebrowAccent}>You set the schedule</p>
            <h2 className={styles.sectionTitleLg}>
              Send your reviews back to Notion
            </h2>
          </div>
        </div>
      </header>
      <p className={styles.sectionLead}>
        Each day's review count <em>and</em> time spent become one row in a
        small Notion database you control. Send on demand, or let us send
        yesterday's row every morning at the time you pick. Days already in
        Notion stay put — we only add new ones.
      </p>

      <div className={styles.exportCard}>
        {!hasTracker && wizard === 'idle' && (
          <div className={styles.firstRunBlock}>
            <p className={styles.firstRunLead}>
              We'll set up a Notion database called "Anki review tracker"
              with three columns ready to go: Date, Reviews, and Time spent
              (minutes). Two short steps.
            </p>
            <button
              type="button"
              className={`${sharedStyles.btnPrimary} ${styles.inlineButton}`}
              onClick={startWizard}
            >
              Set up my review tracker
            </button>
            <details className={styles.advancedDetails}>
              <summary className={styles.advancedSummary}>
                I already have a tracker — pick from a list
              </summary>
              <div className={styles.advancedBody}>
                <NotionDatabasePicker
                  backend={api}
                  value={databaseId}
                  onChange={(id, picked) => {
                    setDatabaseId(id);
                    const nextTitle = picked?.title ?? '';
                    const nextUrl = picked?.url ?? '';
                    setTrackerTitle(nextTitle);
                    setTrackerUrl(nextUrl);
                    writeLocal(TRACKER_TITLE_LOCAL_KEY, nextTitle);
                    writeLocal(TRACKER_URL_LOCAL_KEY, nextUrl);
                  }}
                  onWantToCreate={startWizard}
                />
              </div>
            </details>
          </div>
        )}

        {hasTracker && wizard === 'idle' && (
          <div className={styles.trackerSummary}>
            <div className={styles.trackerSummaryHead}>
              <div>
                <p className={styles.trackerSummaryLabel}>
                  Sending to your Anki review tracker
                </p>
                <p className={styles.trackerSummaryName}>
                  {trackerTitle.length > 0
                    ? trackerTitle
                    : 'Your saved Notion tracker'}
                  {trackerUrl.length > 0 && (
                    <>
                      {' · '}
                      <a
                        href={trackerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.trackerSummaryLink}
                      >
                        Open in Notion
                      </a>
                    </>
                  )}
                </p>
              </div>
              <button
                type="button"
                className={`${sharedStyles.btnSmall} ${styles.inlineButton}`}
                onClick={() => setShowChange((current) => !current)}
              >
                {showChange ? 'Done' : 'Change tracker'}
              </button>
            </div>

            {showChange && (
              <div className={styles.changeBlock}>
                <NotionDatabasePicker
                  backend={api}
                  value={databaseId}
                  onChange={(id, picked) => {
                    setDatabaseId(id);
                    const nextTitle = picked?.title ?? '';
                    const nextUrl = picked?.url ?? '';
                    setTrackerTitle(nextTitle);
                    setTrackerUrl(nextUrl);
                    writeLocal(TRACKER_TITLE_LOCAL_KEY, nextTitle);
                    writeLocal(TRACKER_URL_LOCAL_KEY, nextUrl);
                  }}
                  onWantToCreate={() => {
                    setShowChange(false);
                    startWizard();
                  }}
                />
                <button
                  type="button"
                  className={`${sharedStyles.btnSmall} ${styles.inlineButton}`}
                  onClick={startWizard}
                >
                  Or make a fresh tracker
                </button>
              </div>
            )}

            <form
              className={styles.sendRow}
              onSubmit={(event) => {
                event.preventDefault();
                if (databaseId.trim().length > 0) {
                  exportMutation.mutate();
                }
              }}
            >
              <div className={styles.dateRangeField}>
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
              <button
                type="submit"
                className={`${sharedStyles.btnPrimary} ${styles.inlineButton}`}
                disabled={exportMutation.isPending}
              >
                {exportMutation.isPending ? 'Sending…' : 'Send now'}
              </button>
            </form>

            {exportMutation.isSuccess && result != null && (
              <div className={styles.resultBlock}>
                <p
                  className={
                    allFailed
                      ? sharedStyles.helpDanger
                      : sharedStyles.helpSuccess
                  }
                >
                  {allFailed
                    ? `None of your ${result.totalDays} days could be sent.`
                    : `Sent ${result.exported} new ${result.exported === 1 ? 'day' : 'days'}`}
                  {!allFailed && result.skipped > 0
                    ? `, skipped ${result.skipped} already in Notion`
                    : ''}
                  {!allFailed && errorList.length > 0
                    ? `, ${errorList.length} couldn't be sent`
                    : ''}
                  .
                </p>

                {allFailed && looksLikeMissingProperty && (
                  <div className={styles.shapeWarning}>
                    <p className={styles.shapeWarningText}>
                      This tracker is missing the Date or Reviews column we
                      need. The fastest fix is a fresh tracker we make for
                      you.
                    </p>
                    <button
                      type="button"
                      className={`${sharedStyles.btnPrimary} ${styles.inlineButton}`}
                      onClick={startWizard}
                    >
                      Make a fresh tracker for me
                    </button>
                  </div>
                )}

                {errorList.length > 0 && (
                  <div className={styles.errorListBlock}>
                    <p className={styles.errorListHeading}>
                      What went wrong{errorList.length > 1 ? ', day by day' : ''}:
                    </p>
                    <ul className={styles.errorList}>
                      {visibleErrors.map((line, index) => (
                        <li key={index} className={styles.errorListItem}>
                          {line}
                        </li>
                      ))}
                    </ul>
                    {errorList.length > visibleErrors.length && (
                      <button
                        type="button"
                        className={`${sharedStyles.btnSmall} ${styles.inlineButton}`}
                        onClick={() => setShowAllErrors(true)}
                      >
                        Show all {errorList.length}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {exportMutation.isError &&
              exportMutation.error instanceof TrackerSchemaError && (
                <div className={styles.shapeWarning} role="alert">
                  <p className={styles.shapeWarningText}>
                    This tracker is missing{' '}
                    {(exportMutation.error as TrackerSchemaError).missing
                      .map((m) => `"${m}"`)
                      .join(' and ')}{' '}
                    — the columns we need to write your reviews. The fastest
                    fix is a fresh tracker we make for you.
                  </p>
                  <button
                    type="button"
                    className={`${sharedStyles.btnPrimary} ${styles.inlineButton}`}
                    onClick={startWizard}
                  >
                    Make a fresh tracker for me
                  </button>
                </div>
              )}

            {exportMutation.isError &&
              !(exportMutation.error instanceof TrackerSchemaError) && (
                <p role="alert" className={sharedStyles.helpDanger}>
                  We couldn't send your reviews:{' '}
                  {(exportMutation.error as Error).message}
                </p>
              )}
          </div>
        )}

        {wizard === 'pickParent' && (
          <TrackerParentPicker
            backend={api}
            suggestedPageId={suggestedParentId}
            busy={false}
            onConfirm={(page) => {
              setPendingParent(page);
              setWizard('confirm');
            }}
            onCancel={() => {
              setWizard('idle');
              setPendingParent(null);
            }}
          />
        )}

        {wizard === 'confirm' && pendingParent != null && (
          <div className={styles.trackerStep}>
            <p className={styles.trackerStepLabel}>Step 2 of 2</p>
            <h4 className={styles.trackerStepTitle}>
              Make the tracker under "{pendingParent.title}"?
            </h4>
            <p className={styles.trackerStepHint}>
              We'll add a Notion database called "Anki review tracker" with
              two columns — Date and Reviews. Each day's count becomes one row.
              Nothing else on your Notion page will change.
            </p>
            {createTracker.isError && (
              <p role="alert" className={sharedStyles.helpDanger}>
                Couldn't create the tracker:{' '}
                {(createTracker.error as Error).message}
              </p>
            )}
            <div className={styles.trackerStepActions}>
              <button
                type="button"
                className={`${sharedStyles.btnSecondary} ${styles.inlineButton}`}
                onClick={() => setWizard('pickParent')}
                disabled={createTracker.isPending}
              >
                Back
              </button>
              <button
                type="button"
                className={`${sharedStyles.btnPrimary} ${styles.inlineButton}`}
                onClick={() => createTracker.mutate(pendingParent.id)}
                disabled={createTracker.isPending}
              >
                {createTracker.isPending
                  ? 'Creating…'
                  : 'Create my tracker'}
              </button>
            </div>
          </div>
        )}
      </div>

      {hasTracker && (
        <div className={styles.scheduleCard}>
          <div className={styles.scheduleHeading}>
            <h3 className={styles.scheduleTitle}>
              Send every day, automatically
            </h3>
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
              disabled={saveSchedule.isPending}
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
      )}
    </section>
  );
}
