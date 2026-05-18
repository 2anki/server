import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CookiesProvider } from 'react-cookie';
import { NotionSyncBanner } from './NotionSyncBanner';

vi.mock('../../../lib/backend/get2ankiApi', () => ({
  get2ankiApi: vi.fn(() => ({
    getNotionConnectionInfo: vi.fn().mockResolvedValue({
      isConnected: true,
      link: '/auth/notion',
      workspace: 'My Workspace',
    }),
  })),
}));

function renderBanner(props: { autoSyncActive: boolean }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <CookiesProvider>
      <QueryClientProvider client={queryClient}>
        <NotionSyncBanner {...props} />
      </QueryClientProvider>
    </CookiesProvider>
  );
}

describe('NotionSyncBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.cookie = 'notion_sync_banner_dismissed=; Max-Age=0; path=/';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not render when autoSyncActive is true', () => {
    const { container } = renderBanner({ autoSyncActive: true });
    expect(container.firstChild).toBeNull();
  });

  it('renders dismiss button', async () => {
    renderBanner({ autoSyncActive: false });
    const dismissButton = await screen.findByLabelText('Dismiss Auto Sync banner');
    expect(dismissButton).toBeTruthy();
  });

  it('CTA link carries ref=upload-notion-banner', async () => {
    renderBanner({ autoSyncActive: false });
    const link = await screen.findByText('Try Auto Sync →');
    expect(link.getAttribute('href')).toContain('ref=upload-notion-banner');
  });

  it('hides after dismiss button is clicked', async () => {
    renderBanner({ autoSyncActive: false });
    const dismissButton = await screen.findByLabelText('Dismiss Auto Sync banner');
    fireEvent.click(dismissButton);
    expect(screen.queryByText('Try Auto Sync →')).toBeNull();
  });
});
