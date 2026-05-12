import { useState } from 'react';

import sharedStyles from '../../styles/shared.module.css';
import styles from './OpsPage.module.css';

type Status = 'idle' | 'loading' | 'success' | 'error';

async function callOpsShowcase(
  method: 'POST' | 'DELETE',
  body?: Record<string, string>
): Promise<{ message: string }> {
  const options: RequestInit = {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const response = await fetch(
    method === 'POST' ? '/api/ops/showcase/populate' : '/api/ops/showcase',
    options
  );
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message ?? `${response.status} ${response.statusText}`);
  }
  return response.json();
}

export default function ShowcaseTab() {
  const [pageId, setPageId] = useState('');
  const [apkgKey, setApkgKey] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const handlePopulate = async () => {
    if (pageId.trim().length === 0 || apkgKey.trim().length === 0) return;
    setStatus('loading');
    setMessage('');
    try {
      const result = await callOpsShowcase('POST', {
        pageId: pageId.trim(),
        apkgKey: apkgKey.trim(),
      });
      setStatus('success');
      setMessage(result.message);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handlePurge = async () => {
    setStatus('loading');
    setMessage('');
    try {
      const result = await callOpsShowcase('DELETE');
      setStatus('success');
      setMessage(result.message);
      setPageId('');
      setApkgKey('');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <>
      <p className={styles.panelTitle}>Homepage showcase</p>
      <p className={styles.panelSubtitle}>
        Populate the &ldquo;See it in action&rdquo; section on the homepage with
        a real Notion page and its converted Anki cards.
      </p>

      <section className={`${sharedStyles.surface} ${styles.card}`}>
        <h2 className={styles.cardTitle}>Populate</h2>
        <label className={styles.controlsLabel} htmlFor="showcase-page-id">
          Notion page ID
        </label>
        <input
          id="showcase-page-id"
          className={styles.textInput}
          type="text"
          placeholder="35e7ab29a11e80968a8cea6c5e7ff2e7"
          value={pageId}
          onChange={(e) => setPageId(e.target.value)}
        />
        <label className={styles.controlsLabel} htmlFor="showcase-apkg-key">
          APKG download key
        </label>
        <input
          id="showcase-apkg-key"
          className={styles.textInput}
          type="text"
          placeholder="uploads/owner/file.apkg"
          value={apkgKey}
          onChange={(e) => setApkgKey(e.target.value)}
        />
        <div className={styles.controls}>
          <button
            type="button"
            className={sharedStyles.btnSmall}
            onClick={handlePopulate}
            disabled={
              status === 'loading' ||
              pageId.trim().length === 0 ||
              apkgKey.trim().length === 0
            }
          >
            {status === 'loading' ? 'Working…' : 'Populate showcase'}
          </button>
          <button
            type="button"
            className={sharedStyles.btnSmall}
            onClick={handlePurge}
            disabled={status === 'loading'}
          >
            Purge showcase
          </button>
        </div>
      </section>

      {status === 'success' && message && (
        <div className={`${sharedStyles.alertSuccess} ${styles.banner}`}>
          {message}
        </div>
      )}
      {status === 'error' && message && (
        <div className={`${sharedStyles.alertDanger} ${styles.banner}`}>
          {message}
        </div>
      )}
    </>
  );
}
