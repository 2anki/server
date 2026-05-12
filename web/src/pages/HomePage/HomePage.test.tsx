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
  it('renders the mascot as a brand mark', () => {
    renderHome();
    const mascot = document.querySelector('img[src*="mascot"]');
    expect(mascot).toBeInTheDocument();
  });

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

  it('shows free tier info and open source in the hero', () => {
    renderHome();
    expect(screen.getByText(/100 cards per month/i)).toBeInTheDocument();
    expect(screen.getByText(/open source/i)).toBeInTheDocument();
  });

  it('renders the three how-it-works steps with icons', () => {
    renderHome();
    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText('Convert')).toBeInTheDocument();
    expect(screen.getByText('Study')).toBeInTheDocument();
    const svgs = document.querySelectorAll('svg[viewBox="0 0 24 24"]');
    expect(svgs.length).toBeGreaterThanOrEqual(3);
  });

  it('links to the guide', () => {
    renderHome();
    const link = screen.getByRole('link', {
      name: /read the guide/i,
    });
    expect(link).toHaveAttribute(
      'href',
      '/documentation/start-here/upload-a-file'
    );
  });

  it('renders walkthrough thumbnails with play buttons', () => {
    renderHome();
    const playButtons = screen.getAllByRole('button', { name: /play:/i });
    expect(playButtons.length).toBe(14);
  });
});
