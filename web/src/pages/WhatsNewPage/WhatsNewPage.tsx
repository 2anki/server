import { useEffect, useState } from 'react';
import { FeedbackWidget } from '../../components/FeedbackWidget/FeedbackWidget';
import { changelog, ChangelogEntry } from './changelog';
import sharedStyles from '../../styles/shared.module.css';
import styles from './WhatsNewPage.module.css';

type Tab = 'shipped' | 'in-progress';

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  html_url: string;
  created_at: string;
  labels: Array<{ name: string; color: string }>;
}

interface DateGroup {
  date: string;
  label: string;
  entries: ChangelogEntry[];
}

const PRIORITY_LABELS = ['priority: high', 'priority: medium', 'priority: low'];

function getPriorityWeight(issue: GitHubIssue): number {
  for (const label of issue.labels) {
    const idx = PRIORITY_LABELS.indexOf(label.name.toLowerCase());
    if (idx >= 0) return idx;
  }
  return PRIORITY_LABELS.length;
}

const TYPE_LABELS: Record<string, string> = {
  feature: 'New',
  fix: 'Fix',
  style: 'Design',
};

function groupByDate(entries: ChangelogEntry[]): DateGroup[] {
  const map = new Map<string, ChangelogEntry[]>();
  for (const entry of entries) {
    const group = map.get(entry.date);
    if (group) {
      group.push(entry);
    } else {
      map.set(entry.date, [entry]);
    }
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({
      date,
      label: formatGroupDate(date),
      entries: items,
    }));
}

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatGroupDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function WhatsNewPage() {
  const [tab, setTab] = useState<Tab>('shipped');
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [issuesError, setIssuesError] = useState<string | null>(null);

  const shipped = groupByDate(changelog);

  useEffect(() => {
    if (tab !== 'in-progress') return;
    let cancelled = false;
    setIssuesLoading(true);
    fetch(
      'https://api.github.com/repos/2anki/server/issues?state=open&per_page=30&sort=updated&direction=desc',
      { headers: { Accept: 'application/vnd.github.v3+json' } }
    )
      .then((res) => {
        if (!res.ok) throw new Error(`GitHub API ${res.status}`);
        return res.json();
      })
      .then((data: GitHubIssue[]) => {
        if (cancelled) return;
        setIssues(
          data
            .filter((i) => !i.html_url.includes('/pull/'))
            .sort((a, b) => getPriorityWeight(a) - getPriorityWeight(b))
        );
      })
      .catch((err) => {
        if (!cancelled) setIssuesError(err instanceof Error ? err.message : 'Failed');
      })
      .finally(() => {
        if (!cancelled) setIssuesLoading(false);
      });
    return () => { cancelled = true; };
  }, [tab]);

  return (
    <div className={sharedStyles.page}>
      <header className={sharedStyles.pageHeader}>
        <h1 className={sharedStyles.title}>What's new</h1>
        <p className={sharedStyles.subtitle}>
          Track what we've shipped and what's coming next.
          What do you want us to build? Tell us below.
        </p>
      </header>

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${tab === 'shipped' ? styles.tabActive : ''}`}
          onClick={() => setTab('shipped')}
        >
          Shipped
        </button>
        <button
          type="button"
          className={`${styles.tab} ${tab === 'in-progress' ? styles.tabActive : ''}`}
          onClick={() => setTab('in-progress')}
        >
          In progress
        </button>
      </div>

      {tab === 'shipped' && (
        <div className={styles.timeline}>
          {shipped.map((group) => (
            <div key={group.date} className={styles.dateGroup}>
              <h3 className={styles.dateHeading}>{group.label}</h3>
              <ul className={styles.commitList}>
                {group.entries.map((entry, idx) => (
                  <li key={`${entry.date}-${idx}`} className={styles.commitItem}>
                    <span className={`${styles.typeBadge} ${styles[`badge_${entry.type}`]}`}>
                      {TYPE_LABELS[entry.type] ?? entry.type}
                    </span>
                    <span className={styles.commitText}>{entry.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {tab === 'in-progress' && (
        <>
          {issuesLoading && (
            <div className={sharedStyles.flexCenter}>
              <div className={sharedStyles.spinnerSmall} />
            </div>
          )}
          {issuesError && <div className={sharedStyles.alertDanger}>{issuesError}</div>}
          {!issuesLoading && !issuesError && issues.length === 0 && (
            <p className={styles.empty}>No open issues right now.</p>
          )}
          {issues.length > 0 && (
            <ul className={styles.issueList}>
              {issues.map((issue) => (
                <li key={issue.id} className={styles.issueItem}>
                  <a
                    href={issue.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.issueLink}
                  >
                    <span className={styles.issueTitle}>{issue.title}</span>
                    <span className={styles.issueMeta}>
                      #{issue.number} &middot; {formatDate(issue.created_at)}
                    </span>
                  </a>
                  {issue.labels.length > 0 && (
                    <div className={styles.labelRow}>
                      {issue.labels.map((label) => (
                        <span
                          key={label.name}
                          className={styles.label}
                          style={{
                            background: `#${label.color}20`,
                            color: `#${label.color}`,
                            borderColor: `#${label.color}40`,
                          }}
                        >
                          {label.name}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <div className={styles.feedbackSection}>
        <h2 className={styles.feedbackHeading}>What do you want us to build next?</h2>
        <p className={styles.feedbackSubtext}>
          Your feedback shapes our roadmap. Tell us what matters most to you.
        </p>
        <FeedbackWidget page="/whats-new" />
      </div>
    </div>
  );
}
