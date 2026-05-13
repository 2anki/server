import { useEffect, useRef, useState } from 'react';

import sharedStyles from '../../styles/shared.module.css';
import styles from './OpsPage.module.css';

type OpportunityTag = 'opportunity' | 'insight';

interface InterviewOpportunity {
  id: string;
  body: string;
  tag: OpportunityTag;
}

interface InterviewSnapshot {
  id: string;
  participantName: string;
  memorableQuote: string;
  photoData: string | null;
  signupDate: string | null;
  planTier: string;
  usagePattern: string;
  source: string;
  experienceMapData: string | null;
  interviewDate: string;
  sessionLengthMinutes: number | null;
  createdAt: string;
  opportunities: InterviewOpportunity[];
}

async function apiList(): Promise<InterviewSnapshot[]> {
  const res = await fetch('/api/ops/discovery/snapshots', {
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json() as Promise<InterviewSnapshot[]>;
}

async function apiCreate(
  body: Omit<InterviewSnapshot, 'id' | 'createdAt'>
): Promise<InterviewSnapshot> {
  const res = await fetch('/api/ops/discovery/snapshots', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(data.message ?? `${res.status}`);
  }
  return res.json() as Promise<InterviewSnapshot>;
}

async function apiDelete(id: string): Promise<void> {
  const res = await fetch(`/api/ops/discovery/snapshots/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`${res.status}`);
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function readFileAsDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function blankForm(): Omit<InterviewSnapshot, 'id' | 'createdAt'> {
  return {
    participantName: '',
    memorableQuote: '',
    photoData: null,
    signupDate: '',
    planTier: '',
    usagePattern: '',
    source: '',
    opportunities: [],
    experienceMapData: null,
    interviewDate: new Date().toISOString().slice(0, 10),
    sessionLengthMinutes: null,
  };
}

interface AvatarProps {
  dataUri: string | null;
  name: string;
  size?: number;
}

function Avatar({ dataUri, name, size = 40 }: AvatarProps) {
  if (dataUri) {
    return (
      <img
        src={dataUri}
        alt={name}
        className={styles.interviewAvatar}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={styles.interviewAvatarInitials}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
      aria-label={name}
    >
      {initials(name) || '?'}
    </span>
  );
}

interface SnapshotCardProps {
  snapshot: InterviewSnapshot;
  onDelete: (id: string) => void;
}

function SnapshotCard({ snapshot, onDelete }: SnapshotCardProps) {
  const opportunityCount = snapshot.opportunities.filter((o) => o.tag === 'opportunity').length;
  const insightCount = snapshot.opportunities.filter((o) => o.tag === 'insight').length;

  const handleDelete = () => {
    if (window.confirm(`Delete snapshot for ${snapshot.participantName}?`)) {
      onDelete(snapshot.id);
    }
  };

  return (
    <article className={`${sharedStyles.surface} ${styles.interviewCard}`}>
      <div className={styles.interviewCardHeader}>
        <Avatar dataUri={snapshot.photoData} name={snapshot.participantName} />
        <div className={styles.interviewCardMeta}>
          <span className={styles.interviewCardName}>
            {snapshot.participantName || 'Unknown'}
          </span>
          {snapshot.planTier && (
            <span className={styles.interviewCardTier}>{snapshot.planTier}</span>
          )}
        </div>
        <button
          type="button"
          className={styles.interviewDeleteBtn}
          onClick={handleDelete}
          aria-label={`Delete snapshot for ${snapshot.participantName}`}
        >
          ×
        </button>
      </div>
      {snapshot.memorableQuote && (
        <blockquote className={styles.interviewCardQuote}>
          &ldquo;{snapshot.memorableQuote}&rdquo;
        </blockquote>
      )}
      <div className={styles.interviewCardFooter}>
        <span className={styles.interviewCardDate}>{snapshot.interviewDate}</span>
        {snapshot.opportunities.length > 0 && (
          <span className={styles.interviewCardOpCount}>
            {opportunityCount > 0 && `${opportunityCount} opp${opportunityCount !== 1 ? 's' : ''}`}
            {opportunityCount > 0 && insightCount > 0 && ' · '}
            {insightCount > 0 && `${insightCount} insight${insightCount !== 1 ? 's' : ''}`}
          </span>
        )}
      </div>
    </article>
  );
}

interface SnapshotFormProps {
  onSave: (snapshot: InterviewSnapshot) => void;
  onCancel: () => void;
}

function SnapshotForm({ onSave, onCancel }: SnapshotFormProps) {
  const [form, setForm] = useState(blankForm());
  const [oppInput, setOppInput] = useState('');
  const [oppTag, setOppTag] = useState<OpportunityTag>('opportunity');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);
  const mapInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handlePhotoFile = async (file: File) => {
    const uri = await readFileAsDataUri(file);
    set('photoData', uri);
  };

  const handleMapFile = async (file: File) => {
    const uri = await readFileAsDataUri(file);
    set('experienceMapData', uri);
  };

  const addOpportunity = () => {
    if (oppInput.trim().length === 0) return;
    set('opportunities', [
      ...form.opportunities,
      { id: crypto.randomUUID(), body: oppInput.trim(), tag: oppTag },
    ]);
    setOppInput('');
  };

  const removeOpportunity = (id: string) =>
    set('opportunities', form.opportunities.filter((o) => o.id !== id));

  const handleSave = async () => {
    if (form.participantName.trim().length === 0) return;
    setSaving(true);
    setError('');
    try {
      const snapshot = await apiCreate({
        ...form,
        sessionLengthMinutes: form.sessionLengthMinutes,
      });
      onSave(snapshot);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
      setSaving(false);
    }
  };

  return (
    <div className={styles.interviewForm}>
      {error && (
        <div className={`${sharedStyles.alertDanger} ${styles.banner}`}>{error}</div>
      )}

      <div className={styles.interviewFormSection}>
        <div className={styles.interviewFormRow}>
          <div className={styles.interviewPhotoZone}>
            {form.photoData ? (
              <img
                src={form.photoData}
                alt="Participant"
                className={styles.interviewPhotoPreview}
                onClick={() => photoInputRef.current?.click()}
                style={{ cursor: 'pointer' }}
              />
            ) : (
              <button
                type="button"
                className={styles.interviewPhotoPlaceholder}
                onClick={() => photoInputRef.current?.click()}
                aria-label="Upload participant photo"
              >
                Photo
              </button>
            )}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handlePhotoFile(f);
              }}
            />
          </div>
          <div className={styles.interviewFormParticipant}>
            <input
              className={styles.textInput}
              type="text"
              placeholder="Participant name *"
              value={form.participantName}
              onChange={(e) => set('participantName', e.target.value)}
            />
            <select
              className={styles.textInput}
              value={form.planTier}
              onChange={(e) => set('planTier', e.target.value)}
            >
              <option value="">Plan tier…</option>
              <option value="free">Free</option>
              <option value="patreon">Patreon (lifetime)</option>
              <option value="churned-free">Churned free</option>
              <option value="churned-paid">Churned paid</option>
            </select>
            <input
              className={styles.textInput}
              type="date"
              value={form.signupDate ?? ''}
              onChange={(e) => set('signupDate', e.target.value)}
              title="Account sign-up date"
            />
          </div>
        </div>
      </div>

      <div className={styles.interviewFormSection}>
        <label className={styles.controlsLabel} htmlFor="iv-quote">
          Memorable quote — their exact words
        </label>
        <textarea
          id="iv-quote"
          className={`${styles.textInput} ${styles.interviewQuoteInput}`}
          placeholder="The most vivid or emotional thing they said…"
          value={form.memorableQuote}
          onChange={(e) => set('memorableQuote', e.target.value)}
          rows={3}
        />
      </div>

      <div className={styles.interviewFormSection}>
        <p className={styles.controlsLabel}>Quick facts</p>
        <div className={styles.interviewQuickFacts}>
          <input
            className={styles.textInput}
            type="text"
            placeholder="Usage pattern (e.g. uploads weekly)"
            value={form.usagePattern}
            onChange={(e) => set('usagePattern', e.target.value)}
          />
          <input
            className={styles.textInput}
            type="text"
            placeholder="How they found 2anki"
            value={form.source}
            onChange={(e) => set('source', e.target.value)}
          />
          <input
            className={styles.textInput}
            type="date"
            value={form.interviewDate}
            onChange={(e) => set('interviewDate', e.target.value)}
            title="Interview date"
          />
          <input
            className={styles.textInput}
            type="number"
            placeholder="Session length (min)"
            value={form.sessionLengthMinutes ?? ''}
            onChange={(e) =>
              set(
                'sessionLengthMinutes',
                e.target.value === '' ? null : Number(e.target.value)
              )
            }
            min={0}
          />
        </div>
      </div>

      <div className={styles.interviewFormSection}>
        <label className={styles.controlsLabel} htmlFor="iv-opp-input">
          Opportunities & insights — their words, not solutions, not feelings
        </label>
        <div className={styles.interviewOppRow}>
          <input
            id="iv-opp-input"
            className={styles.textInput}
            type="text"
            placeholder="e.g. I don't want to re-type my notes every time I make a deck"
            value={oppInput}
            onChange={(e) => setOppInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addOpportunity();
              }
            }}
          />
          <select
            className={styles.textInput}
            value={oppTag}
            onChange={(e) => setOppTag(e.target.value as OpportunityTag)}
            style={{ width: 'auto', flexShrink: 0 }}
          >
            <option value="opportunity">Opportunity</option>
            <option value="insight">Insight</option>
          </select>
          <button
            type="button"
            className={sharedStyles.btnSmall}
            onClick={addOpportunity}
            disabled={oppInput.trim().length === 0}
          >
            Add
          </button>
        </div>
        {form.opportunities.length > 0 && (
          <ul className={styles.interviewOppList}>
            {form.opportunities.map((opp) => (
              <li key={opp.id} className={styles.interviewOppItem}>
                <span className={styles.interviewOppTag} data-tag={opp.tag}>
                  {opp.tag}
                </span>
                <span className={styles.interviewOppBody}>{opp.body}</span>
                <button
                  type="button"
                  className={styles.interviewDeleteBtn}
                  onClick={() => removeOpportunity(opp.id)}
                  aria-label="Remove"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.interviewFormSection}>
        <label className={styles.controlsLabel}>
          Experience map — upload a photo or screenshot of the drawn journey
        </label>
        {form.experienceMapData ? (
          <div className={styles.interviewMapPreviewWrap}>
            <img
              src={form.experienceMapData}
              alt="Experience map"
              className={styles.interviewMapPreview}
            />
            <button
              type="button"
              className={sharedStyles.btnSmall}
              onClick={() => set('experienceMapData', null)}
            >
              Remove map
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={styles.interviewMapUploadBtn}
            onClick={() => mapInputRef.current?.click()}
          >
            Upload experience map image
          </button>
        )}
        <input
          ref={mapInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleMapFile(f);
          }}
        />
      </div>

      <div className={styles.interviewFormActions}>
        <button
          type="button"
          className={sharedStyles.btnPrimary}
          onClick={handleSave}
          disabled={saving || form.participantName.trim().length === 0}
        >
          {saving ? 'Saving…' : 'Save snapshot'}
        </button>
        <button type="button" className={sharedStyles.btnSmall} onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function InterviewsTab() {
  const [snapshots, setSnapshots] = useState<InterviewSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'archive' | 'form'>('archive');

  useEffect(() => {
    apiList()
      .then(setSnapshots)
      .catch((err) => setError(err instanceof Error ? err.message : 'Load failed'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (snapshot: InterviewSnapshot) => {
    setSnapshots((prev) => [snapshot, ...prev]);
    setView('archive');
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDelete(id);
      setSnapshots((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  if (view === 'form') {
    return (
      <>
        <div className={styles.tabHeader}>
          <p className={styles.panelTitle}>New interview snapshot</p>
        </div>
        <SnapshotForm onSave={handleSave} onCancel={() => setView('archive')} />
      </>
    );
  }

  return (
    <>
      <div className={styles.interviewArchiveHeader}>
        <div>
          <p className={styles.panelTitle}>Interview snapshots</p>
          <p className={styles.panelSubtitle}>
            One snapshot per customer conversation. Fill in right after the interview, never batched.
          </p>
        </div>
        <button
          type="button"
          className={sharedStyles.btnPrimary}
          onClick={() => setView('form')}
        >
          New snapshot
        </button>
      </div>

      {error && (
        <div className={`${sharedStyles.alertDanger} ${styles.banner}`}>{error}</div>
      )}

      {loading ? (
        <div className={styles.skeletonBar} style={{ height: 120 }} />
      ) : snapshots.length === 0 ? (
        <div className={`${sharedStyles.surface} ${styles.interviewEmpty}`}>
          <p>No snapshots yet. Run your first customer interview and capture it here.</p>
        </div>
      ) : (
        <div className={styles.interviewGrid}>
          {snapshots.map((s) => (
            <SnapshotCard key={s.id} snapshot={s} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </>
  );
}
