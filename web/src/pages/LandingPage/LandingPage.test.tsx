import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

import LandingPage from './LandingPage';
import notionCopy from './copy/notion';

function renderLandingPage(children: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>{children}</HelmetProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('LandingPage', () => {
  it('renders the per-route H1 from the copy file', () => {
    renderLandingPage(
      <LandingPage copy={notionCopy} setErrorMessage={vi.fn()} />
    );
    const heading = screen.getByRole('heading', {
      level: 1,
      name: notionCopy.h1,
    });
    expect(heading).toBeInTheDocument();
  });

  it('renders the UploadForm drop zone above the fold', () => {
    renderLandingPage(
      <LandingPage copy={notionCopy} setErrorMessage={vi.fn()} />
    );
    expect(
      screen.getByText(/Drop your files here/i)
    ).toBeInTheDocument();
  });

  it('links the secondary CTA to /register with the source param', () => {
    renderLandingPage(
      <LandingPage copy={notionCopy} setErrorMessage={vi.fn()} />
    );
    const link = screen.getByRole('link', { name: /sign up free/i });
    expect(link).toHaveAttribute(
      'href',
      `/register?source=${encodeURIComponent(notionCopy.pathname)}`
    );
  });

  it('renders all FAQ summaries closed by default', () => {
    renderLandingPage(
      <LandingPage copy={notionCopy} setErrorMessage={vi.fn()} />
    );
    for (const faq of notionCopy.faqs) {
      const summary = screen.getByText(faq.q);
      expect(summary).toBeInTheDocument();
      const details = summary.closest('details');
      expect(details?.open).toBe(false);
    }
  });

  it('renders the three how-it-works steps with numbered circles', () => {
    renderLandingPage(
      <LandingPage copy={notionCopy} setErrorMessage={vi.fn()} />
    );
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('lists supported format tags', () => {
    renderLandingPage(
      <LandingPage copy={notionCopy} setErrorMessage={vi.fn()} />
    );
    expect(screen.getByText('Notion')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('Markdown')).toBeInTheDocument();
  });
});
