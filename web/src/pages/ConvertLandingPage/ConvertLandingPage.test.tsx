import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

import ConvertLandingPage from './ConvertLandingPage';
import { CONVERT_LANDING_PAGES } from './convertLandingConfig';

function renderAtSlug(slug: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <MemoryRouter initialEntries={[`/convert/${slug}`]}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <Routes>
            <Route
              path="/convert/:slug"
              element={<ConvertLandingPage setErrorMessage={vi.fn()} />}
            />
            <Route path="*" element={<div>Not found fallback</div>} />
          </Routes>
        </HelmetProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('ConvertLandingPage', () => {
  it.each(
    Array.from(CONVERT_LANDING_PAGES.entries())
  )('renders the H1 for slug "%s"', (slug, copy) => {
    renderAtSlug(slug);
    expect(
      screen.getByRole('heading', { level: 1, name: copy.h1 })
    ).toBeInTheDocument();
  });

  it.each(
    Array.from(CONVERT_LANDING_PAGES.entries())
  )('renders all FAQ questions for slug "%s"', (slug, copy) => {
    renderAtSlug(slug);
    for (const faq of copy.faqs) {
      expect(screen.getByText(faq.q)).toBeInTheDocument();
    }
  });

  it('renders the upload form for a known slug', () => {
    renderAtSlug('pdf-to-anki');
    expect(screen.getByText(/Drop your files here/i)).toBeInTheDocument();
  });

  it('renders NotFoundPage for an unknown slug', () => {
    renderAtSlug('unknown-format');
    expect(
      screen.getByRole('heading', { level: 1, name: /page not found/i })
    ).toBeInTheDocument();
  });

  it('links the sign-up CTA to /register with the correct source param', () => {
    renderAtSlug('csv-to-anki');
    const copy = CONVERT_LANDING_PAGES.get('csv-to-anki');
    const link = screen.getByRole('link', { name: /sign up free/i });
    expect(link).toHaveAttribute(
      'href',
      `/register?source=${encodeURIComponent(copy?.pathname ?? '')}`
    );
  });

  it('covers all 6 supported input types', () => {
    expect(CONVERT_LANDING_PAGES.size).toBe(6);
  });

  it('each config entry has a pathname under /convert/', () => {
    for (const copy of Array.from(CONVERT_LANDING_PAGES.values())) {
      expect(copy.pathname).toMatch(/^\/convert\//);
    }
  });
});
