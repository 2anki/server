import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RootErrorBoundary } from './RootErrorBoundary';

function BrokenApp(): ReactElement {
  throw new Error('boom');
}

describe('RootErrorBoundary', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
    localStorage.clear();
  });

  it('renders children while the app is healthy', () => {
    render(
      <RootErrorBoundary>
        <p>App loaded</p>
      </RootErrorBoundary>
    );

    expect(screen.getByText('App loaded')).toBeInTheDocument();
  });

  it('shows the generic recovery screen after a render crash', () => {
    const onError = vi.fn();

    render(
      <RootErrorBoundary onError={onError}>
        <BrokenApp />
      </RootErrorBoundary>
    );

    expect(
      screen.getByRole('heading', { name: /something went wrong loading 2anki/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^reload$/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /reset local data/i })
    ).toBeInTheDocument();
    expect(onError).toHaveBeenCalled();
  });

  it('reloads the page when the user clicks Reload', () => {
    const reloadPage = vi.fn();

    render(
      <RootErrorBoundary reloadPage={reloadPage}>
        <BrokenApp />
      </RootErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: /^reload$/i }));

    expect(reloadPage).toHaveBeenCalledOnce();
  });

  it('clears localStorage and reloads when the user resets local data', () => {
    const reloadPage = vi.fn();
    localStorage.setItem('stale-key', '{"old":true}');

    render(
      <RootErrorBoundary reloadPage={reloadPage}>
        <BrokenApp />
      </RootErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: /reset local data/i }));

    expect(localStorage.getItem('stale-key')).toBeNull();
    expect(reloadPage).toHaveBeenCalledOnce();
  });
});
