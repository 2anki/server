import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LocalDataRecoveryBoundary } from './LocalDataRecoveryBoundary';

function BrokenApp(): ReactElement {
  throw new Error('stale localStorage shape');
}

describe('LocalDataRecoveryBoundary', () => {
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
      <LocalDataRecoveryBoundary>
        <p>App loaded</p>
      </LocalDataRecoveryBoundary>
    );

    expect(screen.getByText('App loaded')).toBeInTheDocument();
  });

  it('shows a reset recovery path after a render crash', () => {
    const onError = vi.fn();

    render(
      <LocalDataRecoveryBoundary onError={onError}>
        <BrokenApp />
      </LocalDataRecoveryBoundary>
    );

    expect(
      screen.getByRole('heading', { name: /could not finish loading/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /reset local data/i })
    ).toBeInTheDocument();
    expect(onError).toHaveBeenCalled();
  });

  it('clears localStorage and reloads when the user resets local data', () => {
    const reloadPage = vi.fn();
    localStorage.setItem('stale-key', '{"old":true}');

    render(
      <LocalDataRecoveryBoundary reloadPage={reloadPage}>
        <BrokenApp />
      </LocalDataRecoveryBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: /reset local data/i }));

    expect(localStorage.getItem('stale-key')).toBeNull();
    expect(reloadPage).toHaveBeenCalledOnce();
  });
});
