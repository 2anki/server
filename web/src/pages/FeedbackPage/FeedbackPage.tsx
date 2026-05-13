import { useEffect, useState } from 'react';

import sharedStyles from '../../styles/shared.module.css';
import styles from './FeedbackPage.module.css';

const MIN_LENGTH = 10;

async function submitFeedback(payload: {
  story: string;
  mainNeed: string;
  secondItem: string;
}): Promise<void> {
  const res = await fetch('/api/feedback/interview', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(data.message ?? `${res.status}`);
  }
}

export default function FeedbackPage() {
  const [story, setStory] = useState('');
  const [mainNeed, setMainNeed] = useState('');
  const [secondItem, setSecondItem] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.title = 'Share your experience · 2anki';
  }, []);

  const canSubmit =
    story.trim().length >= MIN_LENGTH && mainNeed.trim().length >= MIN_LENGTH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      await submitFeedback({
        story: story.trim(),
        mainNeed: mainNeed.trim(),
        secondItem: secondItem.trim(),
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <main className={sharedStyles.pageNarrow}>
        <div className={`${sharedStyles.card} ${styles.successCard}`}>
          <h1 className={styles.successHeading}>Thank you</h1>
          <p className={styles.successBody}>
            We read every response. Your feedback helps shape what we build next.
          </p>
          <a href="/downloads" className={sharedStyles.btnGhost}>
            Back to my decks
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className={sharedStyles.pageNarrow}>
      <header className={styles.header}>
        <h1 className={sharedStyles.title}>Help us build better flashcards</h1>
        <p className={sharedStyles.subtitle}>
          Three quick questions — no rating scales. Just tell us in your own words. Takes about 60 seconds.
        </p>
      </header>

      <div className={sharedStyles.card}>
        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="fb-story" className={styles.label}>
              Tell us about a time 2anki helped you
            </label>
            <textarea
              id="fb-story"
              className={`${sharedStyles.fullWidthTextarea} ${styles.textarea}`}
              rows={4}
              placeholder="For example: I had a 40-page Notion document before an exam and 2anki turned it into 200 cards in under a minute."
              value={story}
              onChange={(e) => setStory(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="fb-need" className={styles.label}>
              What gets in your way?
            </label>
            <textarea
              id="fb-need"
              className={`${sharedStyles.fullWidthTextarea} ${styles.textarea}`}
              rows={3}
              placeholder="Describe the most frustrating part of your current workflow — whatever you wish worked differently."
              value={mainNeed}
              onChange={(e) => setMainNeed(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="fb-extra" className={styles.label}>
              Anything else?{' '}
              <span className={styles.optional}>(optional)</span>
            </label>
            <textarea
              id="fb-extra"
              className={`${sharedStyles.fullWidthTextarea} ${styles.textarea}`}
              rows={2}
              placeholder="Any other observations, wishes, or context you'd like to share."
              value={secondItem}
              onChange={(e) => setSecondItem(e.target.value)}
            />
          </div>

          {error && (
            <p className={styles.errorMsg} role="alert">
              {error}
            </p>
          )}

          <div className={styles.actions}>
            <button
              type="submit"
              className={sharedStyles.btnPrimary}
              disabled={submitting || !canSubmit}
            >
              {submitting ? 'Sending…' : 'Send feedback'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
