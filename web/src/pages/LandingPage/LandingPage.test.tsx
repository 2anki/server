import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';

import LandingPage from './LandingPage';
import notionCopy from './copy/notion';

describe('LandingPage', () => {
  it('renders the per-route H1 from the copy file', () => {
    render(
      <HelmetProvider>
        <LandingPage copy={notionCopy} setErrorMessage={vi.fn()} />
      </HelmetProvider>
    );
    const heading = screen.getByRole('heading', {
      level: 1,
      name: notionCopy.h1,
    });
    expect(heading).toBeInTheDocument();
  });

  it('renders the UploadForm drop zone above the fold', () => {
    render(
      <HelmetProvider>
        <LandingPage copy={notionCopy} setErrorMessage={vi.fn()} />
      </HelmetProvider>
    );
    expect(
      screen.getByText(/Drop your files here/i)
    ).toBeInTheDocument();
  });

  it('links the secondary CTA to /register with the source param', () => {
    render(
      <HelmetProvider>
        <LandingPage copy={notionCopy} setErrorMessage={vi.fn()} />
      </HelmetProvider>
    );
    const link = screen.getByRole('link', { name: /sign up free/i });
    expect(link).toHaveAttribute(
      'href',
      `/register?source=${encodeURIComponent(notionCopy.pathname)}`
    );
  });

  it('renders all FAQ summaries closed by default', () => {
    render(
      <HelmetProvider>
        <LandingPage copy={notionCopy} setErrorMessage={vi.fn()} />
      </HelmetProvider>
    );
    for (const faq of notionCopy.faqs) {
      const summary = screen.getByText(faq.q);
      expect(summary).toBeInTheDocument();
      const details = summary.closest('details');
      expect(details?.open).toBe(false);
    }
  });

  it('renders the three how-it-works steps with numbered circles', () => {
    render(
      <HelmetProvider>
        <LandingPage copy={notionCopy} setErrorMessage={vi.fn()} />
      </HelmetProvider>
    );
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('lists supported format tags', () => {
    render(
      <HelmetProvider>
        <LandingPage copy={notionCopy} setErrorMessage={vi.fn()} />
      </HelmetProvider>
    );
    expect(screen.getByText('Notion')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('Markdown')).toBeInTheDocument();
  });
});
