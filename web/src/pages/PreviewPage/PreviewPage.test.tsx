import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import PreviewPage from './PreviewPage';

const mockUsePreviewStream = vi.fn();

vi.mock('./usePreviewStream', () => ({
  usePreviewStream: (...args: unknown[]) => mockUsePreviewStream(...args),
}));

function renderPreview(id = 'page-abc') {
  return render(
    <MemoryRouter initialEntries={[`/preview/${id}`]}>
      <Routes>
        <Route
          path="/preview/:id"
          element={<PreviewPage setError={vi.fn()} />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('PreviewPage deleted-page handling', () => {
  it('shows not-available state when the error contains 404', () => {
    mockUsePreviewStream.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Resource not found: 404 Not Found'),
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
      refetch: vi.fn(),
    });

    renderPreview();

    expect(
      screen.getByText('This page is no longer available')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'It was deleted in Notion, or the integration lost access.'
      )
    ).toBeInTheDocument();

    const notionLink = screen.getByRole('link', { name: 'Notion search' });
    expect(notionLink).toHaveAttribute('href', '/notion');

    const decksLink = screen.getByRole('link', { name: 'My Decks' });
    expect(decksLink).toHaveAttribute('href', '/downloads');
  });

  it('shows ErrorPresenter for non-404 errors', () => {
    mockUsePreviewStream.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('HTTP error! status: 500, message: Internal'),
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
      refetch: vi.fn(),
    });

    renderPreview();

    expect(
      screen.queryByText('This page is no longer available')
    ).not.toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });
});
