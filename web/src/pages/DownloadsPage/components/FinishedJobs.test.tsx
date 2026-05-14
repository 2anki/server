import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { FinishedJobs } from './FinishedJobs';
import UserUpload from '../../../lib/interfaces/UserUpload';

const mockUseUserLocals = vi.fn();
vi.mock('../../../lib/hooks/useUserLocals', () => ({
  useUserLocals: () => mockUseUserLocals(),
}));

function buildUpload(overrides: Partial<UserUpload> = {}): UserUpload {
  return {
    id: 1,
    key: 'deck-1.apkg',
    filename: 'Pharmacology.apkg',
    object_id: 'obj-1',
    owner: 1,
    created_at: new Date('2026-05-10T11:30:00Z'),
    size: 1024,
    ...overrides,
  } as UserUpload;
}

function renderFinishedJobs() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <FinishedJobs
          uploads={[buildUpload()]}
          deleteUpload={vi.fn().mockResolvedValue(undefined)}
          doneJobs={[]}
          deleteJob={vi.fn()}
        />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('FinishedJobs upgrade footer', () => {
  beforeEach(() => {
    mockUseUserLocals.mockReset();
  });

  it('shows the upgrade footer to free users at the canonical price', () => {
    mockUseUserLocals.mockReturnValue({
      data: { locals: { patreon: false, subscriber: false } },
    });

    renderFinishedJobs();

    const link = screen.getByRole('link', {
      name: /Upgrade to Unlimited — \$6 \/ mo, cancel anytime/,
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/pricing');
    expect(screen.queryByText(/\$5\/month/)).not.toBeInTheDocument();
  });

  it('hides the upgrade footer for lifetime (patreon) users', () => {
    mockUseUserLocals.mockReturnValue({
      data: { locals: { patreon: true, subscriber: false } },
    });

    renderFinishedJobs();

    expect(screen.queryByText(/Hitting the 100-card limit/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /Upgrade to Unlimited/ })
    ).not.toBeInTheDocument();
  });

  it('hides the upgrade footer for monthly subscribers', () => {
    mockUseUserLocals.mockReturnValue({
      data: { locals: { patreon: false, subscriber: true } },
    });

    renderFinishedJobs();

    expect(screen.queryByText(/Hitting the 100-card limit/)).not.toBeInTheDocument();
  });
});
