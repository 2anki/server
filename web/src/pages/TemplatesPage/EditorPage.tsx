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
import galleryStyles from './TemplatesPage.module.css';
import { CodeEditor } from './components/CodeEditor/CodeEditor';
import { BaseType, buildEmptyNoteType, duplicateStarter } from './lib/buildNoteType';
import {
  addField as addFieldOp,
  removeField as removeFieldOp,
  renameField as renameFieldOp,
  setPreviewValue as setPreviewValueOp,
} from './lib/editFields';
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

interface PresetPickerProps {
  loading: boolean;
  presets: NoteTypeStarter[];
  onPick: (pick: NoteTypeStarter | BaseType) => void;
}

function PresetPicker({
  loading,
  presets,
  onPick,
}: Readonly<PresetPickerProps>) {
  return (
    <div className={sharedStyles.page}>
      <Helmet>
        <title>New note type — 2anki</title>
      </Helmet>
      <header className={sharedStyles.pageHeader}>
        <h1 className={sharedStyles.title}>Start a new note type</h1>
        <p className={sharedStyles.subtitle}>
          Pick a starting point. You can rename, edit, and reshape it before saving.
        </p>
      </header>

      <section
        className={editorStyles.presetSection}
        aria-labelledby="preset-blank-heading"
      >
        <h2 id="preset-blank-heading" className={editorStyles.presetHeading}>
          From scratch
        </h2>
        <div className={editorStyles.presetGrid}>
          <button
            type="button"
            className={editorStyles.presetCard}
            onClick={() => onPick('basic')}
          >
            <span className={editorStyles.presetName}>Blank Basic</span>
            <span className={editorStyles.presetDescription}>
              Two fields (Front, Back), one card. Sensible default styles.
            </span>
          </button>
          <button
            type="button"
            className={editorStyles.presetCard}
            onClick={() => onPick('cloze')}
          >
            <span className={editorStyles.presetName}>Blank Cloze</span>
            <span className={editorStyles.presetDescription}>
              Cloze deletion with a Text + Extra field. One card per cloze.
            </span>
          </button>
        </div>
      </section>

      <section
        className={editorStyles.presetSection}
        aria-labelledby="preset-starter-heading"
      >
        <h2
          id="preset-starter-heading"
          className={editorStyles.presetHeading}
        >
          From a starter
        </h2>
        {loading && (
          <p className={editorStyles.presetEmpty}>Loading starters…</p>
        )}
        {!loading && presets.length === 0 && (
          <p className={editorStyles.presetEmpty}>
            No starter templates available right now.
          </p>
        )}
        {presets.length > 0 && (
          <div className={editorStyles.presetGrid}>
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={editorStyles.presetCard}
                onClick={() => onPick(preset)}
              >
                <span className={editorStyles.presetName}>{preset.name}</span>
                <span className={editorStyles.presetDescription}>
                  {preset.description}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <Link to="/templates" className={editorStyles.presetBack}>
        ← Back to Note types
      </Link>
    </div>
  );
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

      <div className={editorStyles.fieldsSection}>
        <div className={editorStyles.fieldsHeader}>
          <span className={editorStyles.fieldsLabel}>Fields</span>
          <button
            type="button"
            className={`${sharedStyles.btnSecondary} ${sharedStyles.btnInline}`}
            onClick={() => setDraft((current) => addFieldOp(current))}
          >
            + Add field
          </button>
        </div>
        <div className={editorStyles.fieldsList}>
          {draft.noteType.flds.map((field, index) => (
            <div key={`${field.ord}-${field.name}`} className={editorStyles.fieldRow}>
              <input
                className={editorStyles.fieldNameInput}
                value={field.name}
                onChange={(event) =>
                  setDraft((current) =>
                    renameFieldOp(current, index, event.target.value)
                  )
                }
                aria-label={`Field ${index + 1} name`}
              />
              <input
                className={editorStyles.fieldPreviewInput}
                value={draft.previewData[field.name] ?? ''}
                onChange={(event) =>
                  setDraft((current) =>
                    setPreviewValueOp(current, field.name, event.target.value)
                  )
                }
                placeholder={`${field.name} preview value`}
                aria-label={`${field.name} preview value`}
              />
              <button
                type="button"
                className={`${sharedStyles.btnSecondary} ${editorStyles.fieldRemove}`}
                onClick={() =>
                  setDraft((current) => removeFieldOp(current, index))
                }
                disabled={draft.noteType.flds.length <= 1}
                aria-label={`Remove ${field.name}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
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
          <div className={editorStyles.previewFrameWrap}>
            <iframe
              title={`${draft.name} ${previewSide} preview`}
              className={editorStyles.previewFrame}
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
  const [presetOptions, setPresetOptions] = useState<NoteTypeStarter[] | null>(
    null
  );
  const [pickedPreset, setPickedPreset] = useState<
    NoteTypeStarter | BaseType | null
  >(null);

  useEffect(() => {
    let cancelled = false;
    if (mode === 'new') {
      if (pickedPreset == null) {
        getDefaultNoteTypes()
          .then((defaults) => {
            if (!cancelled) setPresetOptions(defaults);
          })
          .catch(() => {
            if (!cancelled) setPresetOptions([]);
          });
        return;
      }
      if (pickedPreset === 'basic' || pickedPreset === 'cloze') {
        setInitial(buildEmptyNoteType(pickedPreset));
      } else {
        setInitial(duplicateStarter(pickedPreset));
      }
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
  }, [mode, id, pickedPreset]);

  if (loadError) {
    return (
      <div className={sharedStyles.page}>
        <p className={galleryStyles.error} role="alert">
          {loadError}
        </p>
        <Link to="/templates" className={sharedStyles.btnSecondary}>
          Back to Note types
        </Link>
      </div>
    );
  }

  if (mode === 'new' && pickedPreset == null) {
    return (
      <PresetPicker
        loading={presetOptions == null}
        presets={presetOptions ?? []}
        onPick={setPickedPreset}
      />
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
      <EditorBody initialStarter={initial} shouldFork={shouldFork} />
    </>
  );
}

export default EditorPage;
