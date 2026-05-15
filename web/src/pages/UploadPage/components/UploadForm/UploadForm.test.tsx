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
