import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

import { HomePage } from './HomePage';

function renderHome() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <HomePage setErrorMessage={vi.fn()} isLoggedIn={false} />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('HomePage (anonymous)', () => {
  it('renders the primary h1', () => {
    renderHome();
    expect(
      screen.getByRole('heading', { level: 1, name: /convert notion to anki/i })
    ).toBeInTheDocument();
  });

  it('renders the upload form drop zone', () => {
    renderHome();
    expect(screen.getByText(/drop your files here/i)).toBeInTheDocument();
  });

  it('shows social proof line', () => {
    renderHome();
    expect(screen.getByText(/learners worldwide/i)).toBeInTheDocument();
  });

  it('lists format pills in the hero', () => {
    renderHome();
    for (const format of ['Notion', 'PDF', 'Markdown', 'HTML', 'CSV', 'Word', 'Excel']) {
      expect(screen.getByText(format)).toBeInTheDocument();
    }
  });

  it('renders the three how-it-works steps with richer descriptions', () => {
    renderHome();
    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText('Convert')).toBeInTheDocument();
    expect(screen.getByText('Study')).toBeInTheDocument();
    expect(screen.getByText(/cloze deletions all transfer/i)).toBeInTheDocument();
  });

  it('links to the Notion export guide', () => {
    renderHome();
    const link = screen.getByRole('link', {
      name: /learn how to export/i,
    });
    expect(link).toHaveAttribute(
      'href',
      '/documentation/start-here/upload-a-file'
    );
  });

  it('renders walkthrough videos from the playlist', () => {
    renderHome();
    const iframes = document.querySelectorAll('iframe[src*="youtube.com/embed"]');
    expect(iframes.length).toBe(6);
  });
});
