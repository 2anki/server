import { useEffect, useState } from 'react';
import sharedStyles from '../../styles/shared.module.css';
import styles from './WhatsNewPage.module.css';

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: string;
  created_at: string;
  labels: Array<{ name: string; color: string }>;
}

const PRIORITY_LABELS = ['priority: high', 'priority: medium', 'priority: low'];

function getPriorityWeight(issue: GitHubIssue): number {
  for (const label of issue.labels) {
    const idx = PRIORITY_LABELS.indexOf(label.name.toLowerCase());
    if (idx >= 0) return idx;
  }
  return PRIORITY_LABELS.length;
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

export default function WhatsNewPage() {
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch(
          'https://api.github.com/repos/2anki/server/issues?state=open&per_page=50&sort=updated&direction=desc',
          { headers: { Accept: 'application/vnd.github.v3+json' } }
        );
        if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
        const data: GitHubIssue[] = await response.json();
        if (!cancelled) {
          const sorted = data
            .filter((i) => !i.html_url.includes('/pull/'))
            .sort((a, b) => getPriorityWeight(a) - getPriorityWeight(b));
          setIssues(sorted);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load issues');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className={sharedStyles.page}>
      <header className={sharedStyles.pageHeader}>
        <h1 className={sharedStyles.title}>What's new</h1>
        <p className={sharedStyles.subtitle}>
          Features and improvements the team is working on, prioritized by impact.
        </p>
      </header>

      {loading && (
        <div className={sharedStyles.flexCenter}>
          <div className={sharedStyles.spinnerSmall} />
        </div>
      )}

      {error && (
        <div className={sharedStyles.alertDanger}>{error}</div>
      )}

      {!loading && !error && issues.length === 0 && (
        <p className={styles.empty}>No open issues right now — check back soon.</p>
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
    </div>
  );
}
