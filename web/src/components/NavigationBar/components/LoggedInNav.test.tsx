import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import { LoggedInNav } from './LoggedInNav';

interface RenderOpts {
  patreon?: boolean;
  subscriber?: boolean;
}

function renderNav({ patreon = false, subscriber = false }: RenderOpts = {}) {
  return render(
    <LoggedInNav path="/" locals={{ patreon, subscriber }} />
  );
}

describe('LoggedInNav top-level links', () => {
  it('renders Upload, Library, Search, Docs at top level for free users', () => {
    renderNav();
    expect(screen.getByRole('link', { name: 'Upload' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Library' })).toHaveAttribute(
      'href',
      '/downloads'
    );
    expect(screen.getByRole('link', { name: 'Search' })).toHaveAttribute(
      'href',
      '/notion'
    );
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute(
      'href',
      '/documentation'
    );
  });

  it('shows Pricing top-level for free users', () => {
    renderNav();
    expect(screen.getByRole('link', { name: 'Pricing' })).toHaveAttribute(
      'href',
      '/pricing'
    );
  });

  it('hides Pricing top-level for stripe subscribers', () => {
    renderNav({ subscriber: true });
    expect(
      screen.queryByRole('link', { name: 'Pricing' })
    ).not.toBeInTheDocument();
  });

  it('hides Pricing top-level for patreon users', () => {
    renderNav({ patreon: true });
    expect(
      screen.queryByRole('link', { name: 'Pricing' })
    ).not.toBeInTheDocument();
  });

  it('shows Ankify top-level for patreon users', () => {
    renderNav({ patreon: true });
    expect(screen.getByRole('link', { name: 'Ankify' })).toHaveAttribute(
      'href',
      '/ankify'
    );
  });

  it('does not show Ankify for non-patreon users', () => {
    renderNav({ subscriber: true });
    expect(
      screen.queryByRole('link', { name: 'Ankify' })
    ).not.toBeInTheDocument();
  });

  it('does not render the legacy ⋯ button', () => {
    renderNav();
    expect(screen.queryByText('⋯')).not.toBeInTheDocument();
  });

  it('does not render the legacy Documentation label', () => {
    renderNav();
    expect(
      screen.queryByRole('link', { name: 'Documentation' })
    ).not.toBeInTheDocument();
  });
});
