import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { UploadPage } from './UploadPage';

const dismissUploadPrimer = vi.fn(async () => {});

vi.mock('../../lib/data_layer/userPreferencesSync', () => ({
  UPLOAD_PRIMER_DISMISSED_KEY: 'upload_primer_dismissed',
  dismissUploadPrimer: () => dismissUploadPrimer(),
}));

vi.mock('./components/UploadForm/UploadForm', () => ({
  default: () => <div data-testid="upload-form-stub" />,
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/upload']}>
      <Routes>
        <Route
          path="/upload"
          element={<UploadPage setErrorMessage={() => {}} />}
        />
      </Routes>
    </MemoryRouter>
  );

describe('UploadPage primer', () => {
  beforeEach(() => {
    dismissUploadPrimer.mockClear();
    globalThis.localStorage?.removeItem('upload_primer_dismissed');
  });

  afterEach(() => {
    globalThis.localStorage?.removeItem('upload_primer_dismissed');
  });

  it('renders the primer by default', () => {
    renderPage();
    expect(screen.getByText('Make cards from your Notion toggles')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dismiss tips' })).toBeInTheDocument();
  });

  it('hides the primer after the dismiss button is clicked and calls the sync helper', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss tips' }));
    expect(screen.queryByText('Make cards from your Notion toggles')).not.toBeInTheDocument();
    expect(dismissUploadPrimer).toHaveBeenCalledTimes(1);
  });

  it('does not render the primer when the dismiss flag is already set in localStorage', () => {
    globalThis.localStorage?.setItem('upload_primer_dismissed', 'true');
    renderPage();
    expect(screen.queryByText('Make cards from your Notion toggles')).not.toBeInTheDocument();
  });
});
