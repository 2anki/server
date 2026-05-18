import { render, act, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, beforeEach, describe, expect, it, test, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

import UploadForm from './UploadForm';

vi.mock('../../../../lib/analytics/track', () => ({
  track: vi.fn(),
}));

type AnalyticsGlobals = {
  hj?: ReturnType<typeof vi.fn>;
  gtag?: ReturnType<typeof vi.fn>;
};

function renderUploadForm(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </MemoryRouter>
  );
}

describe('UploadForm', () => {
  test('no null classes', () => {
    const { container } = renderUploadForm(
      <UploadForm setErrorMessage={vi.fn()} />
    );
    expect(container.querySelector('.null')).toBeNull();
  });

  test('renders the Google Drive chip enabled when env vars are configured', () => {
    const previousClient = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const previousKey = process.env.REACT_APP_GOOGLE_API_KEY;
    process.env.REACT_APP_GOOGLE_CLIENT_ID = 'test-client';
    process.env.REACT_APP_GOOGLE_API_KEY = 'test-key';
    try {
      const { container } = renderUploadForm(
        <UploadForm setErrorMessage={vi.fn()} />
      );
      const chip = container.querySelector('button[aria-label="Google Drive"]');
      expect(chip).not.toBeNull();
      expect(chip?.hasAttribute('disabled')).toBe(false);
    } finally {
      process.env.REACT_APP_GOOGLE_CLIENT_ID = previousClient;
      process.env.REACT_APP_GOOGLE_API_KEY = previousKey;
    }
  });

  test('renders the Google Drive chip disabled when env vars are missing', () => {
    const previousClient = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const previousKey = process.env.REACT_APP_GOOGLE_API_KEY;
    process.env.REACT_APP_GOOGLE_CLIENT_ID = '';
    process.env.REACT_APP_GOOGLE_API_KEY = '';
    try {
      const { container } = renderUploadForm(
        <UploadForm setErrorMessage={vi.fn()} />
      );
      const chip = container.querySelector('button[aria-label="Google Drive"]');
      expect(chip).not.toBeNull();
      expect(chip?.hasAttribute('disabled')).toBe(true);
    } finally {
      process.env.REACT_APP_GOOGLE_CLIENT_ID = previousClient;
      process.env.REACT_APP_GOOGLE_API_KEY = previousKey;
    }
  });
});

describe('UploadForm analytics events', () => {
  beforeEach(() => {
    (globalThis as AnalyticsGlobals).gtag = vi.fn();
    (globalThis as AnalyticsGlobals).hj = vi.fn();
  });

  afterEach(() => {
    delete (globalThis as AnalyticsGlobals).gtag;
    delete (globalThis as AnalyticsGlobals).hj;
    vi.restoreAllMocks();
  });

  it('fires upload_started when the form is submitted', async () => {
    const gtag = (globalThis as AnalyticsGlobals).gtag!;

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      redirected: false,
      status: 200,
      headers: new Headers({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="deck.apkg"',
        'X-Card-Count': '5',
      }),
      blob: () => Promise.resolve(new Blob(['fake'])),
    }));

    const { container } = renderUploadForm(<UploadForm setErrorMessage={vi.fn()} />);

    const form = container.querySelector('form')!;
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(gtag).toHaveBeenCalledWith('event', 'upload_started');
  });

  it('tracks upload_started with source=file on form submit', async () => {
    const { track } = await import('../../../../lib/analytics/track');
    const trackMock = vi.mocked(track);
    trackMock.mockClear();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      redirected: false,
      status: 200,
      headers: new Headers({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="deck.apkg"',
        'X-Card-Count': '5',
      }),
      blob: () => Promise.resolve(new Blob(['fake'])),
    }));

    const { container } = renderUploadForm(<UploadForm setErrorMessage={vi.fn()} />);
    const form = container.querySelector('form')!;
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(trackMock).toHaveBeenCalledWith('upload_started', { source: 'file' });
  });

  it('tracks upload_started with source=dropbox when Dropbox chooser returns a file', async () => {
    const { track } = await import('../../../../lib/analytics/track');
    const trackMock = vi.mocked(track);
    trackMock.mockClear();

    const previousKey = process.env.REACT_APP_DROPBOX_APP_KEY;
    process.env.REACT_APP_DROPBOX_APP_KEY = 'test-key';
    (window as unknown as { Dropbox?: unknown }).Dropbox = {
      choose: ({ success }: { success: (files: unknown[]) => void }) => {
        success([
          {
            id: 'id:2',
            name: 'notes.pdf',
            bytes: 100,
            icon: 'page',
            isDir: false,
            link: 'https://dl.dropboxusercontent.com/x/notes.pdf',
            linkType: 'direct',
          },
        ]);
      },
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      redirected: false,
      status: 200,
      headers: new Headers({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="deck.apkg"',
        'X-Card-Count': '3',
      }),
      blob: () => Promise.resolve(new Blob(['fake'])),
    }));

    const { container } = renderUploadForm(<UploadForm setErrorMessage={vi.fn()} />);
    const button = container.querySelector('button[aria-label="Choose from Dropbox"]') as HTMLButtonElement;
    await act(async () => {
      button.click();
    });

    await waitFor(() =>
      expect(trackMock).toHaveBeenCalledWith('upload_started', { source: 'dropbox' })
    );

    delete (window as unknown as { Dropbox?: unknown }).Dropbox;
    process.env.REACT_APP_DROPBOX_APP_KEY = previousKey;
  });

  it('fires conversion_success on a successful conversion with cards', async () => {
    const gtag = (globalThis as AnalyticsGlobals).gtag!;

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      redirected: false,
      status: 200,
      headers: new Headers({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="deck.apkg"',
        'X-Card-Count': '5',
      }),
      blob: () => Promise.resolve(new Blob(['fake'])),
    }));

    const { container } = renderUploadForm(<UploadForm setErrorMessage={vi.fn()} />);

    const form = container.querySelector('form')!;
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(gtag).toHaveBeenCalledWith('event', 'conversion_success');
  });

  it('posts to /api/upload/dropbox when the chooser returns a file', async () => {
    const previousKey = process.env.REACT_APP_DROPBOX_APP_KEY;
    process.env.REACT_APP_DROPBOX_APP_KEY = 'test-key';
    (window as unknown as { Dropbox?: unknown }).Dropbox = {
      choose: ({ success }: { success: (files: unknown[]) => void }) => {
        success([
          {
            id: 'id:1',
            name: 'pharm.pdf',
            bytes: 200,
            icon: 'page_white_acrobat',
            isDir: false,
            link: 'https://dl.dropboxusercontent.com/x/pharm.pdf',
            linkType: 'direct',
          },
        ]);
      },
    };
    const fetchMock = vi.fn().mockResolvedValue({
      redirected: false,
      status: 200,
      headers: new Headers({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="deck.apkg"',
        'X-Card-Count': '7',
      }),
      blob: () => Promise.resolve(new Blob(['fake'])),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { container } = renderUploadForm(<UploadForm setErrorMessage={vi.fn()} />);
    const button = container.querySelector(
      'button[aria-label="Choose from Dropbox"]'
    ) as HTMLButtonElement;
    expect(button).not.toBeNull();
    await act(async () => {
      button.click();
    });
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.find(
          (call) => call[0] === '/api/upload/dropbox'
        )
      ).toBeDefined()
    );
    const dropboxCall = fetchMock.mock.calls.find(
      (call) => call[0] === '/api/upload/dropbox'
    )!;
    expect(dropboxCall[1]).toEqual(expect.objectContaining({ method: 'post' }));
    const body = dropboxCall[1].body as FormData;
    expect(JSON.parse(body.get('files') as string)).toEqual([
      expect.objectContaining({ name: 'pharm.pdf', linkType: 'direct' }),
    ]);

    delete (window as unknown as { Dropbox?: unknown }).Dropbox;
    process.env.REACT_APP_DROPBOX_APP_KEY = previousKey;
  });

  it('shows the local panel and hides the Dropbox panel by default', () => {
    const previousKey = process.env.REACT_APP_DROPBOX_APP_KEY;
    process.env.REACT_APP_DROPBOX_APP_KEY = 'test-key';
    const { container } = renderUploadForm(<UploadForm setErrorMessage={vi.fn()} />);
    const localPanel = container.querySelector('#upload-panel-local')!;
    const dropboxPanel = container.querySelector('#upload-panel-dropbox')!;
    expect(localPanel.getAttribute('aria-hidden')).toBe('false');
    expect(dropboxPanel.getAttribute('aria-hidden')).toBe('true');
    process.env.REACT_APP_DROPBOX_APP_KEY = previousKey;
  });

  it('reveals the Dropbox panel and hides the local panel when the Dropbox chip is clicked', async () => {
    const previousKey = process.env.REACT_APP_DROPBOX_APP_KEY;
    process.env.REACT_APP_DROPBOX_APP_KEY = 'test-key';
    const { container } = renderUploadForm(<UploadForm setErrorMessage={vi.fn()} />);
    const dropboxChip = container.querySelector('button[aria-label="Dropbox"]') as HTMLButtonElement;
    expect(dropboxChip).toBeTruthy();
    await act(async () => {
      dropboxChip.click();
    });
    const localPanel = container.querySelector('#upload-panel-local')!;
    const dropboxPanel = container.querySelector('#upload-panel-dropbox')!;
    expect(localPanel.getAttribute('aria-hidden')).toBe('true');
    expect(dropboxPanel.getAttribute('aria-hidden')).toBe('false');
    process.env.REACT_APP_DROPBOX_APP_KEY = previousKey;
  });

  it('keeps the same file input mounted across a chip switch round-trip', async () => {
    const previousKey = process.env.REACT_APP_DROPBOX_APP_KEY;
    process.env.REACT_APP_DROPBOX_APP_KEY = 'test-key';
    const { container } = renderUploadForm(<UploadForm setErrorMessage={vi.fn()} />);
    const before = container.querySelector('input#pakker');
    const dropboxChip = container.querySelector('button[aria-label="Dropbox"]') as HTMLButtonElement;
    await act(async () => {
      dropboxChip.click();
    });
    await act(async () => {
      dropboxChip.click();
    });
    const after = container.querySelector('input#pakker');
    expect(after).toBe(before);
    process.env.REACT_APP_DROPBOX_APP_KEY = previousKey;
  });

  it('does not fire conversion_success when the deck is empty', async () => {
    const gtag = (globalThis as AnalyticsGlobals).gtag!;

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      redirected: false,
      status: 200,
      headers: new Headers({
        'Content-Type': 'application/octet-stream',
        'X-Card-Count': '0',
      }),
      blob: () => Promise.resolve(new Blob(['fake'])),
    }));

    const { container } = renderUploadForm(<UploadForm setErrorMessage={vi.fn()} />);

    const form = container.querySelector('form')!;
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(gtag).not.toHaveBeenCalledWith('event', 'conversion_success');
  });

  it('shows the chat CTA link in the error state', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      redirected: false,
      status: 400,
      text: () => Promise.resolve('Bad request'),
      headers: new Headers({ 'Content-Type': 'text/plain' }),
    }));

    const { container } = renderUploadForm(<UploadForm setErrorMessage={vi.fn()} />);
    const form = container.querySelector('form')!;
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    await waitFor(() => {
      expect(container.querySelector('a[href*="/chat"]')).not.toBeNull();
    });
    const link = container.querySelector('a[href*="/chat"]') as HTMLAnchorElement;
    expect(link.textContent).toContain('Stuck?');
    expect(link.href).toContain('from=upload');
  });

  it('fires upload_error_chat_shown once when the error state mounts', async () => {
    const { track } = await import('../../../../lib/analytics/track');
    const trackMock = vi.mocked(track);
    trackMock.mockClear();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      redirected: false,
      status: 400,
      text: () => Promise.resolve('Bad request'),
      headers: new Headers({ 'Content-Type': 'text/plain' }),
    }));

    const { container } = renderUploadForm(<UploadForm setErrorMessage={vi.fn()} />);
    const form = container.querySelector('form')!;
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    await waitFor(() => {
      expect(container.querySelector('a[href*="/chat"]')).not.toBeNull();
    });

    const chatShownCalls = trackMock.mock.calls.filter(
      ([name]) => name === 'upload_error_chat_shown'
    );
    expect(chatShownCalls).toHaveLength(1);
  });

  it('fires upload_error_chat_engaged when the chat CTA is clicked', async () => {
    const { track } = await import('../../../../lib/analytics/track');
    const trackMock = vi.mocked(track);
    trackMock.mockClear();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      redirected: false,
      status: 400,
      text: () => Promise.resolve('Bad request'),
      headers: new Headers({ 'Content-Type': 'text/plain' }),
    }));

    const { container } = renderUploadForm(<UploadForm setErrorMessage={vi.fn()} />);
    const form = container.querySelector('form')!;
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    await waitFor(() => {
      expect(container.querySelector('a[href*="/chat"]')).not.toBeNull();
    });

    const link = container.querySelector('a[href*="/chat"]') as HTMLAnchorElement;
    await act(async () => {
      fireEvent.click(link);
    });

    const engagedCalls = trackMock.mock.calls.filter(
      ([name]) => name === 'upload_error_chat_engaged'
    );
    expect(engagedCalls).toHaveLength(1);
  });

  it('shows the inline chat toggle in the empty-deck state', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      redirected: false,
      status: 200,
      headers: new Headers({
        'Content-Type': 'application/octet-stream',
        'X-Card-Count': '0',
      }),
      blob: () => Promise.resolve(new Blob(['fake'])),
    }));

    const { container } = renderUploadForm(<UploadForm setErrorMessage={vi.fn()} />);
    const form = container.querySelector('form')!;
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    await waitFor(() => {
      const toggle = container.querySelector('button[aria-expanded]');
      expect(toggle).not.toBeNull();
      expect(toggle?.textContent).toContain('Ask Claude about this file');
    });
  });
});
