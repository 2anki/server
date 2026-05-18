import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { UploadPage } from './UploadPage';

const dismissUploadPrimer = vi.fn(async () => {});
const fetchUserPreferences = vi.fn();

vi.mock('../../lib/data_layer/userPreferencesSync', () => ({
  dismissUploadPrimer: () => dismissUploadPrimer(),
  fetchUserPreferences: () => fetchUserPreferences(),
}));

vi.mock('./components/UploadForm/UploadForm', () => ({
  default: () => <div data-testid="upload-form-stub" />,
}));

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/upload']}>
        <Routes>
          <Route
            path="/upload"
            element={<UploadPage setErrorMessage={() => {}} />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('UploadPage primer', () => {
  beforeEach(() => {
    dismissUploadPrimer.mockClear();
    fetchUserPreferences.mockReset();
  });

  it('renders the primer when the server says it is not dismissed', async () => {
    fetchUserPreferences.mockResolvedValue({
      cardOptions: null,
      theme: null,
      ankiWebAcknowledgedAt: null,
      uploadPrimerDismissedAt: null,
    });
    renderPage();
    expect(await screen.findByText('Make cards from your Notion toggles')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dismiss tips' })).toBeInTheDocument();
  });

  it('hides the primer when the server says it has been dismissed (cross-device case)', async () => {
    fetchUserPreferences.mockResolvedValue({
      cardOptions: null,
      theme: null,
      ankiWebAcknowledgedAt: null,
      uploadPrimerDismissedAt: '2026-05-18T12:00:00.000Z',
    });
    renderPage();
    await waitFor(() => expect(fetchUserPreferences).toHaveBeenCalled());
    expect(screen.queryByText('Make cards from your Notion toggles')).not.toBeInTheDocument();
  });

  it('hides the primer on dismiss and persists to the server', async () => {
    fetchUserPreferences.mockResolvedValue({
      cardOptions: null,
      theme: null,
      ankiWebAcknowledgedAt: null,
      uploadPrimerDismissedAt: null,
    });
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Dismiss tips' }));
    await waitFor(() =>
      expect(screen.queryByText('Make cards from your Notion toggles')).not.toBeInTheDocument()
    );
    expect(dismissUploadPrimer).toHaveBeenCalledTimes(1);
  });

  it('does not show the primer while the preferences query is loading', () => {
    fetchUserPreferences.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.queryByText('Make cards from your Notion toggles')).not.toBeInTheDocument();
  });
});
