import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';

import {
  AnkiNoteType,
  NoteTypeStarter,
  downloadNoteTypeApkg,
  getDefaultNoteTypes,
  getUserTemplates,
  saveUserTemplate,
} from '../../lib/backend/templates';
import sharedStyles from '../../styles/shared.module.css';
import editorStyles from './EditorPage.module.css';
import styles from './TemplatesPage.module.css';
import { CodeEditor } from './components/CodeEditor/CodeEditor';
import { BaseType, buildEmptyNoteType, duplicateStarter } from './lib/buildNoteType';
import { buildPreviewDocument } from './renderNoteTypePreview';

type Pane = 'front' | 'back' | 'css';

function safeFilename(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length === 0) return 'note-type';
  return trimmed.replace(/[^A-Za-z0-9\-_ ]/g, '_');
}

function getSaveLabel(saving: boolean, shouldFork: boolean): string {
  if (saving) return 'Saving…';
  return shouldFork ? 'Save as copy' : 'Save';
}

async function findStarter(id: string): Promise<NoteTypeStarter | null> {
  const [defaults, user] = await Promise.all([
    getDefaultNoteTypes().catch(() => []),
    getUserTemplates().catch(() => ({ templates: [], hiddenIds: [] })),
  ]);
  const all = [...defaults, ...user.templates];
  return all.find((s) => s.id === id) ?? null;
}

interface EditorBodyProps {
  initialStarter: NoteTypeStarter;
  shouldFork: boolean;
}

function EditorBody({
  initialStarter,
  shouldFork,
}: Readonly<EditorBodyProps>) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<NoteTypeStarter>(initialStarter);
  const [pane, setPane] = useState<Pane>('front');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    setDraft(initialStarter);
  }, [initialStarter]);

  const previewSide: 'front' | 'back' = pane === 'back' ? 'back' : 'front';
  const previewDoc = useMemo(
    () => buildPreviewDocument(draft.noteType, draft.previewData, previewSide),
    [draft, previewSide]
  );

  const updateNoteType = useCallback((updater: (n: AnkiNoteType) => AnkiNoteType) => {
    setDraft((current) => ({ ...current, noteType: updater(current.noteType) }));
  }, []);

  const setQfmt = (value: string) => {
    updateNoteType((n) => ({
      ...n,
      tmpls: n.tmpls.map((t, i) => (i === 0 ? { ...t, qfmt: value } : t)),
    }));
  };
  const setAfmt = (value: string) => {
    updateNoteType((n) => ({
      ...n,
      tmpls: n.tmpls.map((t, i) => (i === 0 ? { ...t, afmt: value } : t)),
    }));
  };
  const setCss = (value: string) => {
    updateNoteType((n) => ({ ...n, css: value }));
  };

  const handleNameChange = (value: string) => {
    setDraft((current) => ({
      ...current,
      name: value,
      noteType: { ...current.noteType, name: value },
    }));
  };

  const handleDescriptionChange = (value: string) => {
    setDraft((current) => ({ ...current, description: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const starterToSave = shouldFork ? duplicateStarter(draft) : draft;
      await saveUserTemplate(starterToSave);
      setSavedAt(Date.now());
      if (starterToSave.id !== draft.id) {
        navigate(`/templates/edit/${encodeURIComponent(starterToSave.id)}`, {
          replace: true,
        });
      }
    } catch (error: unknown) {
      setSaveError(
        error instanceof Error ? error.message : 'Could not save template'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await downloadNoteTypeApkg(draft.noteType, draft.previewData);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${safeFilename(draft.name)}.apkg`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error: unknown) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Could not generate .apkg — try again.'
      );
    }
  };

  const template = draft.noteType.tmpls[0];
  const activeValueByPane: Record<Pane, string> = {
    front: template.qfmt,
    back: template.afmt,
    css: draft.noteType.css,
  };
  const setActiveValueByPane: Record<Pane, (value: string) => void> = {
    front: setQfmt,
    back: setAfmt,
    css: setCss,
  };
  const activeValue = activeValueByPane[pane];
  const setActiveValue = setActiveValueByPane[pane];
  const activeLanguage: 'html' | 'css' = pane === 'css' ? 'css' : 'html';

  return (
    <div className={editorStyles.layout}>
      <header className={editorStyles.header}>
        <div className={editorStyles.headerLeft}>
          <Link to="/templates" className={editorStyles.backLink}>
            ← Note types
          </Link>
          <input
            className={editorStyles.nameInput}
            value={draft.name}
            onChange={(event) => handleNameChange(event.target.value)}
            placeholder="Template name"
            aria-label="Template name"
          />
        </div>
        <div className={editorStyles.headerActions}>
          {saveError && (
            <span className={editorStyles.error} role="alert">
              {saveError}
            </span>
          )}
          {savedAt && !saveError && (
            <span className={editorStyles.savedHint}>Saved</span>
          )}
          <button
            type="button"
            className={sharedStyles.btnSecondary}
            onClick={handleDownload}
          >
            Download .apkg
          </button>
          <button
            type="button"
            className={sharedStyles.btnPrimary}
            onClick={handleSave}
            disabled={saving}
          >
            {getSaveLabel(saving, shouldFork)}
          </button>
        </div>
      </header>

      <div className={editorStyles.descriptionRow}>
        <input
          className={editorStyles.descriptionInput}
          value={draft.description}
          onChange={(event) => handleDescriptionChange(event.target.value)}
          placeholder="One-line description (optional)"
          aria-label="Description"
        />
      </div>

      <div className={editorStyles.workspace}>
        <div className={editorStyles.editorPane}>
          <div
            className={editorStyles.tabs}
            role="tablist"
            aria-label="Edit panes"
          >
            {(['front', 'back', 'css'] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={pane === value}
                className={`${editorStyles.tab} ${pane === value ? editorStyles.tabActive : ''}`}
                onClick={() => setPane(value)}
              >
                {value === 'front' && 'Front'}
                {value === 'back' && 'Back'}
                {value === 'css' && 'Styling'}
              </button>
            ))}
          </div>
          <div className={editorStyles.editorBox}>
            <CodeEditor
              language={activeLanguage}
              value={activeValue}
              onChange={setActiveValue}
              ariaLabel={`${pane} editor`}
            />
          </div>
        </div>

        <div className={editorStyles.previewPane}>
          <div className={editorStyles.previewLabel}>
            Live preview &mdash; {previewSide}
          </div>
          <div className={styles.modalFrameWrap}>
            <iframe
              title={`${draft.name} ${previewSide} preview`}
              className={styles.modalFrame}
              sandbox=""
              srcDoc={previewDoc}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface EditorPageProps {
  mode: 'new' | 'edit';
}

export function EditorPage({ mode }: Readonly<EditorPageProps>) {
  const { id } = useParams<{ id: string }>();
  const [initial, setInitial] = useState<NoteTypeStarter | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [shouldFork, setShouldFork] = useState(false);
  const [baseType, setBaseType] = useState<BaseType>('basic');

  useEffect(() => {
    let cancelled = false;
    if (mode === 'new') {
      setInitial(buildEmptyNoteType(baseType));
      setShouldFork(false);
      return;
    }
    if (!id) {
      setLoadError('Missing template id');
      return;
    }
    setLoadError(null);
    findStarter(id)
      .then(async (starter) => {
        if (cancelled) return;
        if (!starter) {
          setLoadError('Template not found');
          return;
        }
        const userPayload = await getUserTemplates().catch(() => ({
          templates: [],
          hiddenIds: [],
        }));
        const owned = userPayload.templates.some((t) => t.id === starter.id);
        setShouldFork(!owned);
        setInitial(starter);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadError(
          error instanceof Error ? error.message : 'Could not load template'
        );
      });
    return () => {
      cancelled = true;
    };
  }, [mode, id, baseType]);

  if (loadError) {
    return (
      <div className={sharedStyles.page}>
        <p className={styles.error} role="alert">
          {loadError}
        </p>
        <Link to="/templates" className={sharedStyles.btnSecondary}>
          Back to Note types
        </Link>
      </div>
    );
  }

  if (!initial) {
    return (
      <div className={sharedStyles.page}>
        <div className={sharedStyles.spinner ?? ''} />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {mode === 'new' ? 'New note type' : `Edit ${initial.name}`} — 2anki
        </title>
      </Helmet>
      {mode === 'new' && (
        <div className={editorStyles.baseTypeBar}>
          <span className={editorStyles.baseTypeLabel}>Base type</span>
          {(['basic', 'cloze'] as const).map((value) => (
            <button
              key={value}
              type="button"
              className={`${editorStyles.baseTypeOption} ${baseType === value ? editorStyles.baseTypeOptionActive : ''}`}
              onClick={() => setBaseType(value)}
            >
              {value === 'basic' ? 'Basic' : 'Cloze'}
            </button>
          ))}
        </div>
      )}
      <EditorBody initialStarter={initial} shouldFork={shouldFork} />
    </>
  );
}

export default EditorPage;
