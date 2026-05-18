import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AnswersPage from './AnswersPage';
import { ANSWERS_PAGES } from './answersConfig';

function renderAtSlug(slug: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/answers/${slug}`]}>
        <Routes>
          <Route path="/answers/:slug" element={<AnswersPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe('AnswersPage', () => {
  it('renders the h1 for a known slug', () => {
    const config = ANSWERS_PAGES.get('convert-notion-to-anki');
    renderAtSlug('convert-notion-to-anki');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      config!.h1
    );
  });

  it('renders all section headings for a known slug', () => {
    const config = ANSWERS_PAGES.get('pdf-to-anki');
    renderAtSlug('pdf-to-anki');
    for (const section of config!.sections) {
      expect(screen.getByText(section.heading)).toBeInTheDocument();
    }
  });

  it('renders the not-found page for an unknown slug', () => {
    renderAtSlug('does-not-exist');
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });

  it('all related links contain ?ref=ai', () => {
    for (const [slug, config] of Array.from(ANSWERS_PAGES.entries())) {
      renderAtSlug(slug);
      for (const link of config.relatedLinks) {
        expect(link.href).toContain('?ref=ai');
      }
    }
  });

  it('renders the notion-to-anki-sync page', () => {
    const config = ANSWERS_PAGES.get('notion-to-anki-sync');
    renderAtSlug('notion-to-anki-sync');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      config!.h1
    );
  });

  it('renders the quizlet-to-anki page', () => {
    const config = ANSWERS_PAGES.get('quizlet-to-anki');
    renderAtSlug('quizlet-to-anki');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      config!.h1
    );
  });
});
