import { render, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, beforeEach, describe, expect, it, test, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

import UploadForm from './UploadForm';

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

  it('reveals the Dropbox panel and hides the local panel when its tab is clicked', async () => {
    const previousKey = process.env.REACT_APP_DROPBOX_APP_KEY;
    process.env.REACT_APP_DROPBOX_APP_KEY = 'test-key';
    const { container } = renderUploadForm(<UploadForm setErrorMessage={vi.fn()} />);
    const dropboxTab = Array.from(
      container.querySelectorAll('button[role="tab"]')
    ).find((b) => b.textContent === 'Dropbox') as HTMLButtonElement;
    expect(dropboxTab).toBeTruthy();
    await act(async () => {
      dropboxTab.click();
    });
    const localPanel = container.querySelector('#upload-panel-local')!;
    const dropboxPanel = container.querySelector('#upload-panel-dropbox')!;
    expect(localPanel.getAttribute('aria-hidden')).toBe('true');
    expect(dropboxPanel.getAttribute('aria-hidden')).toBe('false');
    process.env.REACT_APP_DROPBOX_APP_KEY = previousKey;
  });

  it('keeps the same file input mounted across a tab switch round-trip', async () => {
    const previousKey = process.env.REACT_APP_DROPBOX_APP_KEY;
    process.env.REACT_APP_DROPBOX_APP_KEY = 'test-key';
    const { container } = renderUploadForm(<UploadForm setErrorMessage={vi.fn()} />);
    const before = container.querySelector('input#pakker');
    const tabs = Array.from(container.querySelectorAll('button[role="tab"]'));
    const dropboxTab = tabs.find((b) => b.textContent === 'Dropbox') as HTMLButtonElement;
    const localTab = tabs.find((b) => b.textContent === 'Your computer') as HTMLButtonElement;
    await act(async () => {
      dropboxTab.click();
    });
    await act(async () => {
      localTab.click();
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
});
