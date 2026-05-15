import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import SearchObjectEntry from './index';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../../../lib/backend/get2ankiApi', () => ({
  get2ankiApi: () => ({ convert: vi.fn() }),
}));

function renderEntry(overrides: Partial<Parameters<typeof SearchObjectEntry>[0]> = {}) {
  const defaults = {
    isFavorite: false,
    title: 'Organic Chemistry',
    icon: undefined,
    url: 'https://notion.so/page-abc',
    id: 'page-abc',
    type: 'page',
    setFavorites: vi.fn(),
    setError: vi.fn(),
  };
  return render(
    <MemoryRouter initialEntries={['/notion']}>
      <SearchObjectEntry {...defaults} {...overrides} />
    </MemoryRouter>
  );
}

describe('SearchObjectEntry rules link', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('encodes page title into returnTo so /notion is pre-filled on return', () => {
    renderEntry({ title: 'Organic Chemistry', id: 'page-abc' });

    fireEvent.click(
      screen.getByRole('button', { name: 'Configure rules for Organic Chemistry' })
    );

    expect(mockNavigate).toHaveBeenCalledOnce();
    const destination: string = mockNavigate.mock.calls[0][0];
    expect(destination).toContain('/rules/page-abc');
    expect(destination).toContain('returnTo=%2Fnotion%3Fq%3DOrganic%2BChemistry');
  });

  it('encodes special characters in title correctly', () => {
    renderEntry({ title: 'Med & Law 101', id: 'page-xyz' });

    fireEvent.click(
      screen.getByRole('button', { name: 'Configure rules for Med & Law 101' })
    );

    const destination: string = mockNavigate.mock.calls[0][0];
    expect(destination).toContain('returnTo=%2Fnotion%3Fq%3D');
    expect(destination).not.toContain('returnTo=/notion');
  });
});
