import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import CardOptionsPage from './CardOptionsPage';

vi.mock('../../lib/backend/get2ankiApi', () => ({
  get2ankiApi: () => mockApi,
}));

vi.mock('../../components/CardOptionsForm/CardOptionsForm', () => ({
  CardOptionsForm: () => <div data-testid="card-options-form" />,
}));

const mockApi = {
  listSettings: vi.fn(),
};

function renderPage(search = '') {
  return render(
    <MemoryRouter initialEntries={[`/card-options${search}`]}>
      <CardOptionsPage setErrorMessage={vi.fn()} />
    </MemoryRouter>
  );
}

describe('CardOptionsPage per-page list', () => {
  beforeEach(() => {
    mockApi.listSettings.mockResolvedValue({ items: [] });
  });

  it('shows the per-page overrides heading on the default view', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Per-page overrides')).toBeInTheDocument();
    });
  });

  it('shows empty state when no per-page overrides exist', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('No per-page overrides saved.')).toBeInTheDocument();
    });
  });

  it('renders a row for each saved per-page override', async () => {
    mockApi.listSettings.mockResolvedValue({
      items: [
        { pageId: 'abc-123', updatedAt: '2026-01-15T10:00:00.000Z' },
        { pageId: 'def-456', updatedAt: null },
      ],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /abc-123/i })).toHaveAttribute(
        'href',
        '/card-options?pageId=abc-123'
      );
      expect(screen.getByRole('link', { name: /def-456/i })).toHaveAttribute(
        'href',
        '/card-options?pageId=def-456'
      );
    });
  });

  it('does not render the per-page list when viewing a specific page', async () => {
    mockApi.listSettings.mockResolvedValue({
      items: [{ pageId: 'abc-123', updatedAt: null }],
    });
    renderPage('?pageId=abc-123');
    await waitFor(() => {
      expect(
        screen.queryByText('Per-page overrides')
      ).not.toBeInTheDocument();
    });
  });
});
