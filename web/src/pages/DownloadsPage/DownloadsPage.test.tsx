import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { DownloadsPage } from './DownloadsPage';
import JobResponse from '../../schemas/public/JobResponse';
import { JobsId } from '../../schemas/public/Jobs';

vi.mock('./hooks/useJobs', () => ({
  default: () => ({
    jobs: mockJobs,
    deleteJob: vi.fn(),
    restartJob: vi.fn(),
    refreshJobs: vi.fn().mockResolvedValue(undefined),
    lastFetchedAt: new Date('2026-05-18T12:00:00Z'),
  }),
}));

vi.mock('./hooks/useUploads', () => ({
  default: () => ({
    uploads: mockUploads,
    loading: false,
    error: null,
    deleteUpload: vi.fn(),
    refreshUploads: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('../../lib/backend/get2ankiApi', () => ({
  get2ankiApi: () => ({}),
}));

vi.mock('../../lib/hooks/useUserLocals', () => ({
  useUserLocals: () => ({
    data: { locals: { patreon: false, subscriber: false } },
  }),
}));

vi.mock('./hooks/useDropboxUploads', () => ({
  default: () => ({
    uploads: mockDropboxUploads,
    loading: false,
    error: false,
    deleteUpload: vi.fn(),
    loadMore: vi.fn(),
    hasMore: false,
  }),
}));

vi.mock('./hooks/useGoogleDriveUploads', () => ({
  default: () => ({
    uploads: mockGoogleDriveUploads,
    loading: false,
    error: false,
    deleteUpload: vi.fn(),
    loadMore: vi.fn(),
    hasMore: false,
  }),
}));

type AnalyticsGlobals = {
  hj?: ReturnType<typeof vi.fn>;
  gtag?: ReturnType<typeof vi.fn>;
};

let mockJobs: JobResponse[] = [];
let mockUploads: { id: string; size_mb: number; owner: number; key: string; filename: string; object_id: string; created_at: string | null }[] = [];
let mockDropboxUploads: { id: number; bytes: number; name: string; created_at: string | null }[] = [];
let mockGoogleDriveUploads: { id: string; iconUrl: string; mimeType: string; name: string; sizeBytes: string | null; url: string; last_converted_at: string | null }[] = [];

const buildJob = (overrides: Partial<JobResponse> = {}): JobResponse => ({
  id: 1 as JobsId,
  owner: 'owner-1',
  object_id: 'page-id',
  status: 'started',
  created_at: new Date('2026-05-10T11:30:00Z'),
  last_edited_time: new Date('2026-05-10T11:30:00Z'),
  title: 'Active conversion',
  type: 'page',
  job_reason_failure: null,
  restartable: false,
  ...overrides,
});

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <DownloadsPage setError={vi.fn()} />
    </MemoryRouter>
  );

describe('DownloadsPage paywall query param', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-10T12:00:00Z'));
    (globalThis as AnalyticsGlobals).hj = vi.fn();
    (globalThis as AnalyticsGlobals).gtag = vi.fn();
    mockJobs = [buildJob()];
    mockUploads = [];
    mockDropboxUploads = [];
    mockGoogleDriveUploads = [];
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (globalThis as AnalyticsGlobals).hj;
    delete (globalThis as AnalyticsGlobals).gtag;
  });

  it('shows PaywallBanner when ?paywall=1 is present', () => {
    renderAt('/downloads?paywall=1');
    expect(
      screen.getByText('One conversion at a time on the free plan')
    ).toBeInTheDocument();
  });

  it('does not show PaywallBanner without ?paywall=1', () => {
    renderAt('/downloads');
    expect(
      screen.queryByText('One conversion at a time on the free plan')
    ).not.toBeInTheDocument();
  });

  it('renders PaywallBanner without the in-progress affordance when no active job exists', () => {
    mockJobs = [];
    renderAt('/downloads?paywall=1');
    expect(
      screen.getByText('One conversion at a time on the free plan')
    ).toBeInTheDocument();
    expect(screen.queryByText(/Or wait for/)).not.toBeInTheDocument();
  });
});

describe('DownloadsPage empty state', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-18T12:00:00Z'));
    (globalThis as AnalyticsGlobals).hj = vi.fn();
    (globalThis as AnalyticsGlobals).gtag = vi.fn();
    mockJobs = [];
    mockUploads = [];
    mockDropboxUploads = [];
    mockGoogleDriveUploads = [];
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (globalThis as AnalyticsGlobals).hj;
    delete (globalThis as AnalyticsGlobals).gtag;
  });

  it('shows empty state when all four sources are empty', () => {
    renderAt('/downloads');
    expect(screen.getByText('No decks yet')).toBeInTheDocument();
  });

  it('hides empty state when doneJobs has entries', () => {
    mockJobs = [buildJob({ status: 'done' })];
    renderAt('/downloads');
    expect(screen.queryByText('No decks yet')).not.toBeInTheDocument();
  });

  it('hides empty state when uploads has entries', () => {
    mockUploads = [
      { id: 'u1', size_mb: 1, owner: 1, key: 'k1', filename: 'deck.apkg', object_id: 'o1', created_at: '2026-05-18T10:00:00Z' },
    ];
    renderAt('/downloads');
    expect(screen.queryByText('No decks yet')).not.toBeInTheDocument();
  });
});

describe('DownloadsPage chip filters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-18T12:00:00Z'));
    (globalThis as AnalyticsGlobals).hj = vi.fn();
    (globalThis as AnalyticsGlobals).gtag = vi.fn();
    mockUploads = [];
    mockDropboxUploads = [
      { id: 10, bytes: 1024, name: 'notes.html', created_at: '2026-05-17T08:00:00Z' },
    ];
    mockGoogleDriveUploads = [];
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (globalThis as AnalyticsGlobals).hj;
    delete (globalThis as AnalyticsGlobals).gtag;
  });

  it('chip filter ?filter=in-progress shows only active jobs', () => {
    mockJobs = [
      buildJob({ id: 1 as JobsId, status: 'started', title: 'Active job' }),
      buildJob({ id: 2 as JobsId, status: 'done', title: 'Done job' }),
    ];
    renderAt('/downloads?filter=in-progress');
    expect(screen.getByText('Active job')).toBeInTheDocument();
    expect(screen.queryByText('Done job')).not.toBeInTheDocument();
  });

  it('chip filter ?filter=dropbox shows only Dropbox rows', () => {
    mockJobs = [buildJob({ status: 'done', title: 'Notion deck' })];
    renderAt('/downloads?filter=dropbox');
    expect(screen.getByText('notes.html')).toBeInTheDocument();
    expect(screen.queryByText('Notion deck')).not.toBeInTheDocument();
  });

  it('shows "No decks match this filter." when filter has no results', () => {
    mockJobs = [];
    mockDropboxUploads = [];
    renderAt('/downloads?filter=dropbox');
    expect(screen.getByText('No decks match this filter.')).toBeInTheDocument();
  });
});

describe('DownloadsPage source labels', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-18T12:00:00Z'));
    (globalThis as AnalyticsGlobals).hj = vi.fn();
    (globalThis as AnalyticsGlobals).gtag = vi.fn();
    mockUploads = [];
    mockDropboxUploads = [];
    mockGoogleDriveUploads = [];
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (globalThis as AnalyticsGlobals).hj;
    delete (globalThis as AnalyticsGlobals).gtag;
  });

  it('shows "AI-generated from upload" label for claude jobs', () => {
    mockJobs = [buildJob({ type: 'claude', status: 'done', title: 'Claude deck' })];
    renderAt('/downloads');
    expect(screen.getByText('AI-generated from upload')).toBeInTheDocument();
  });

  it('shows "Notion" source label for notion jobs', () => {
    mockJobs = [buildJob({ type: 'page', status: 'done', title: 'Notion deck' })];
    renderAt('/downloads');
    expect(screen.getAllByText('Notion').length).toBeGreaterThan(0);
  });
});
