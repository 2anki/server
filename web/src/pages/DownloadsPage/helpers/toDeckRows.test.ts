import { describe, expect, it } from 'vitest';

import JobResponse from '../../../schemas/public/JobResponse';
import UserUpload from '../../../lib/interfaces/UserUpload';
import { DropboxUpload, GoogleDriveUpload } from '../../../lib/backend';
import { toDeckRows } from './toDeckRows';
import { JobsId } from '../../../schemas/public/Jobs';

const makeJob = (overrides: Partial<JobResponse> = {}): JobResponse => ({
  id: 1 as JobsId,
  owner: 'user-1',
  object_id: 'obj-1',
  status: 'done',
  created_at: new Date('2026-05-10T10:00:00Z'),
  last_edited_time: new Date('2026-05-10T10:00:00Z'),
  title: 'Test Deck',
  type: 'page',
  job_reason_failure: null,
  restartable: false,
  ...overrides,
});

const makeUpload = (overrides: Partial<UserUpload> = {}): UserUpload => ({
  id: 'upload-1',
  size_mb: 1,
  owner: 1,
  key: 'key-1',
  filename: 'deck.apkg',
  object_id: 'obj-upload-1',
  created_at: '2026-05-10T09:00:00Z',
  ...overrides,
});

const makeDropboxUpload = (overrides: Partial<DropboxUpload> = {}): DropboxUpload => ({
  id: 10,
  bytes: 1024,
  name: 'notes.html',
  created_at: '2026-05-09T08:00:00Z',
  ...overrides,
});

const makeGoogleDriveUpload = (overrides: Partial<GoogleDriveUpload> = {}): GoogleDriveUpload => ({
  id: 'gdrive-1',
  iconUrl: 'https://ssl.gstatic.com/icon.png',
  mimeType: 'text/html',
  name: 'study.html',
  sizeBytes: '2048',
  url: 'https://drive.google.com/file/d/abc',
  last_converted_at: '2026-05-08T07:00:00Z',
  ...overrides,
});

describe('toDeckRows — source mapping', () => {
  it('maps job.type === "page" to source: notion', () => {
    const rows = toDeckRows([makeJob({ type: 'page' })], [], [], []);
    expect(rows[0].source).toBe('notion');
  });

  it('maps job.type === "database" to source: notion', () => {
    const rows = toDeckRows([makeJob({ type: 'database' })], [], [], []);
    expect(rows[0].source).toBe('notion');
  });

  it('maps job.type === "conversion" to source: notion', () => {
    const rows = toDeckRows([makeJob({ type: 'conversion' })], [], [], []);
    expect(rows[0].source).toBe('notion');
  });

  it('maps job.type === "claude" to source: upload', () => {
    const rows = toDeckRows([makeJob({ type: 'claude' })], [], [], []);
    expect(rows[0].source).toBe('upload');
  });

  it('maps unknown job.type to source: upload', () => {
    const rows = toDeckRows([makeJob({ type: 'apkg_import' })], [], [], []);
    expect(rows[0].source).toBe('upload');
  });

  it('maps UserUpload to source: upload, kind: file', () => {
    const rows = toDeckRows([], [makeUpload()], [], []);
    expect(rows[0]).toMatchObject({ source: 'upload', kind: 'file' });
  });

  it('maps DropboxUpload to source: dropbox, kind: dropbox', () => {
    const rows = toDeckRows([], [], [makeDropboxUpload()], []);
    expect(rows[0]).toMatchObject({ source: 'dropbox', kind: 'dropbox' });
  });

  it('maps GoogleDriveUpload to source: drive, kind: drive', () => {
    const rows = toDeckRows([], [], [], [makeGoogleDriveUpload()]);
    expect(rows[0]).toMatchObject({ source: 'drive', kind: 'drive' });
  });
});

describe('toDeckRows — sorting', () => {
  it('sorts merged rows by sortKey descending (newest first)', () => {
    const olderJob = makeJob({ id: 1 as JobsId, created_at: new Date('2026-05-08T00:00:00Z') });
    const newerJob = makeJob({ id: 2 as JobsId, created_at: new Date('2026-05-10T00:00:00Z') });
    const rows = toDeckRows([olderJob, newerJob], [], [], []);
    expect(rows[0].sortKey.getTime()).toBeGreaterThan(rows[1].sortKey.getTime());
  });

  it('places null created_at at the end', () => {
    const jobWithDate = makeJob({ id: 1 as JobsId, created_at: new Date('2026-05-10T00:00:00Z') });
    const jobNoDate = makeJob({ id: 2 as JobsId, created_at: null });
    const rows = toDeckRows([jobNoDate, jobWithDate], [], [], []);
    expect((rows[0] as { source: string; kind: string; job: JobResponse; sortKey: Date }).job.id).toBe(1);
  });

  it('handles created_at when API returns it as an ISO string (not a Date)', () => {
    const isoString = '2026-05-10T00:00:00.000Z';
    const job = makeJob({
      id: 1 as JobsId,
      created_at: isoString as unknown as Date,
    });
    const rows = toDeckRows([job], [], [], []);
    expect(rows[0].sortKey).toBeInstanceOf(Date);
    expect(rows[0].sortKey.getTime()).toBe(new Date(isoString).getTime());
  });
});
