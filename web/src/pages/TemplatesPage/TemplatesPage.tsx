import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import {
  NoteTypeStarter,
  downloadNoteTypeApkg,
  getDefaultNoteTypes,
  getUserTemplates,
} from '../../lib/backend/templates';
import sharedStyles from '../../styles/shared.module.css';
import styles from './TemplatesPage.module.css';
import { buildPreviewDocument } from './renderNoteTypePreview';

function safeFilename(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length === 0) return 'note-type';
  return trimmed.replace(/[^A-Za-z0-9\-_ ]/g, '_');
}

async function triggerDownload(starter: NoteTypeStarter): Promise<void> {
  const blob = await downloadNoteTypeApkg(starter.noteType, starter.previewData);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${safeFilename(starter.name)}.apkg`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

interface NoteTypeCardProps {
  starter: NoteTypeStarter;
  busy: boolean;
  ownedByUser: boolean;
  onDownload: (starter: NoteTypeStarter) => void;
  onPreview: (starter: NoteTypeStarter) => void;
}

function NoteTypeCard({
  starter,
  busy,
  ownedByUser,
  onDownload,
  onPreview,
}: Readonly<NoteTypeCardProps>) {
  const previewDoc = useMemo(
    () => buildPreviewDocument(starter.noteType, starter.previewData, 'front'),
    [starter]
  );
  const editHref = `/templates/edit/${encodeURIComponent(starter.id)}`;

  return (
    <article className={styles.card}>
      <div className={styles.previewWrap}>
        <iframe
          title={`${starter.name} preview`}
          className={styles.previewFrame}
          sandbox=""
          srcDoc={previewDoc}
        />
      </div>
      <div className={styles.body}>
        <h2 className={styles.name}>
          <button
            type="button"
            className={styles.nameButton}
            onClick={() => onPreview(starter)}
          >
            {starter.name}
          </button>
        </h2>
        <p className={styles.description}>{starter.description}</p>
        <div className={styles.actions}>
          <button
            type="button"
            className={`${sharedStyles.btnPrimary} ${sharedStyles.btnInline}`}
            onClick={() => onDownload(starter)}
            disabled={busy}
          >
            {busy ? 'Preparing…' : 'Download .apkg'}
          </button>
          <Link
            to={editHref}
            className={`${sharedStyles.btnSecondary} ${sharedStyles.btnInline}`}
          >
            {ownedByUser ? 'Edit' : 'Customize'}
          </Link>
        </div>
      </div>
    </article>
  );
}

interface PreviewModalProps {
  starter: NoteTypeStarter;
  onClose: () => void;
}

function PreviewModal({ starter, onClose }: Readonly<PreviewModalProps>) {
  const frontDoc = useMemo(
    () => buildPreviewDocument(starter.noteType, starter.previewData, 'front'),
    [starter]
  );
  const backDoc = useMemo(
    () => buildPreviewDocument(starter.noteType, starter.previewData, 'back'),
    [starter]
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className={sharedStyles.modal}>
      <button
        type="button"
        className={sharedStyles.modalBackdrop}
        onClick={onClose}
        aria-label="Close preview"
      />
      <dialog
        open
        aria-modal="true"
        aria-labelledby="note-type-preview-title"
        className={`${sharedStyles.modalCard} ${styles.dialog}`}
      >
        <div className={sharedStyles.modalHeader}>
          <h2
            id="note-type-preview-title"
            className={sharedStyles.modalHeaderTitle}
          >
            {starter.name}
          </h2>
          <button
            type="button"
            className={sharedStyles.modalClose}
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.modalSide}>
            <span className={styles.sideLabel}>Front</span>
            <div className={styles.modalFrameWrap}>
              <iframe
                title={`${starter.name} front preview`}
                className={styles.modalFrame}
                sandbox=""
                srcDoc={frontDoc}
              />
            </div>
          </div>
          <div className={styles.modalSide}>
            <span className={styles.sideLabel}>Back</span>
            <div className={styles.modalFrameWrap}>
              <iframe
                title={`${starter.name} back preview`}
                className={styles.modalFrame}
                sandbox=""
                srcDoc={backDoc}
              />
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}

export function TemplatesPage() {
  const [starters, setStarters] = useState<NoteTypeStarter[] | null>(null);
  const [userIds, setUserIds] = useState<Set<string>>(new Set());
  const [loadError, setLoadError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [previewed, setPreviewed] = useState<NoteTypeStarter | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    Promise.all([
      getDefaultNoteTypes(),
      getUserTemplates().catch(() => ({ templates: [], hiddenIds: [] })),
    ])
      .then(([defaults, user]) => {
        if (cancelled) return;
        const hidden = new Set(user.hiddenIds);
        const visibleDefaults = defaults.filter((s) => !hidden.has(s.id));
        const seen = new Set<string>();
        const merged: NoteTypeStarter[] = [];
        for (const item of [...user.templates, ...visibleDefaults]) {
          if (!item?.id || seen.has(item.id)) continue;
          seen.add(item.id);
          merged.push(item);
        }
        setStarters(merged);
        setUserIds(new Set(user.templates.map((t) => t.id)));
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadError(
          error instanceof Error ? error.message : 'Could not load note types'
        );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDownload = useCallback(async (starter: NoteTypeStarter) => {
    setDownloadError(null);
    setBusyId(starter.id);
    try {
      await triggerDownload(starter);
    } catch (error: unknown) {
      setDownloadError(
        error instanceof Error
          ? error.message
          : 'Could not generate .apkg — try again.'
      );
    } finally {
      setBusyId(null);
    }
  }, []);

  return (
    <div className={sharedStyles.page}>
      <Helmet>
        <title>Note types — 2anki</title>
      </Helmet>
      <header className={`${sharedStyles.pageHeader} ${styles.pageHeaderRow}`}>
        <div>
          <h1 className={sharedStyles.title}>Note types</h1>
          <p className={sharedStyles.subtitle}>
            Starter Anki note types you can drop in or customize. Open the .apkg in Anki to import.
          </p>
        </div>
        <Link
          to="/templates/new"
          className={`${sharedStyles.btnPrimary} ${sharedStyles.btnInline}`}
        >
          New note type
        </Link>
      </header>

      {loadError && (
        <div className={styles.error} role="alert">
          Could not load note types. {loadError}
        </div>
      )}
      {downloadError && (
        <div className={styles.error} role="alert">
          {downloadError}
        </div>
      )}

      {starters?.length === 0 && !loadError && (
        <div className={styles.empty}>
          No starter note types are available right now.
        </div>
      )}

      {starters && starters.length > 0 && (
        <section className={styles.grid} aria-label="Available note types">
          {starters.map((starter) => (
            <NoteTypeCard
              key={starter.id}
              starter={starter}
              ownedByUser={userIds.has(starter.id)}
              busy={busyId === starter.id}
              onDownload={handleDownload}
              onPreview={setPreviewed}
            />
          ))}
        </section>
      )}

      {previewed && (
        <PreviewModal
          starter={previewed}
          onClose={() => setPreviewed(null)}
        />
      )}
    </div>
  );
}

export default TemplatesPage;
