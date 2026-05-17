import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import RulesPage from './RulesPage';

vi.mock('../../lib/backend/get2ankiApi', () => ({
  get2ankiApi: () => mockApi,
}));

vi.mock('../../components/CardOptionsForm/CardOptionsForm', () => ({
  CardOptionsForm: vi.fn((_props: unknown, _ref: unknown) => (
    <div data-testid="card-options-form" />
  )),
}));

const mockApi = {
  getRules: vi.fn(),
  getFavorites: vi.fn(),
  deleteRules: vi.fn(),
  deleteSettings: vi.fn(),
  addFavorite: vi.fn(),
  deleteFavorite: vi.fn(),
};

function renderPage(id = 'page-abc') {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/rules/${id}`]}>
        <Routes>
          <Route
            path="/rules/:id"
            element={<RulesPage setErrorMessage={vi.fn()} />}
          />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe('RulesPage meta', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.getRules.mockResolvedValue(null);
    mockApi.getFavorites.mockResolvedValue([]);
  });

  it('renders a noindex meta tag so bots do not index the parser-rules editor', () => {
    renderPage();
    const meta = document.querySelector('meta[name="robots"]');
    expect(meta).not.toBeNull();
    expect(meta?.getAttribute('content')).toBe('noindex, nofollow');
  });
});

describe('RulesPage reset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.getRules.mockResolvedValue(null);
    mockApi.getFavorites.mockResolvedValue([]);
    mockApi.deleteRules.mockResolvedValue(undefined);
    mockApi.deleteSettings.mockResolvedValue(undefined);
  });

  it('shows the Reset to defaults button', async () => {
    renderPage();
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Reset to defaults' })
      ).toBeInTheDocument();
    });
  });

  it('calls deleteRules and deleteSettings when Reset to defaults is clicked', async () => {
    renderPage('page-xyz');
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Reset to defaults' })
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Reset to defaults' }));

    await waitFor(() => {
      expect(mockApi.deleteRules).toHaveBeenCalledWith('page-xyz');
      expect(mockApi.deleteSettings).toHaveBeenCalledWith('page-xyz');
    });
  });
});
