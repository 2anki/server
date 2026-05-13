import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmailVerificationBanner } from './EmailVerificationBanner';

const STORAGE_KEY = 'email_verification_pending';

describe('EmailVerificationBanner', () => {
  const storage: Record<string, string> = {};

  beforeEach(() => {
    const mockStorage = {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => { storage[key] = value; },
      removeItem: (key: string) => { delete storage[key]; },
    };
    Object.defineProperty(globalThis, 'sessionStorage', {
      value: mockStorage,
      writable: true,
    });
  });

  afterEach(() => {
    for (const key of Object.keys(storage)) {
      delete storage[key];
    }
  });

  it('renders when email_verification_pending is set', () => {
    storage[STORAGE_KEY] = 'true';

    render(<EmailVerificationBanner />);

    expect(screen.getByText(/check your inbox to verify your email/i)).toBeTruthy();
  });

  it('does not render when email_verification_pending is absent', () => {
    render(<EmailVerificationBanner />);

    expect(screen.queryByText(/check your inbox/i)).toBeNull();
  });

  it('dismisses and clears sessionStorage when the dismiss button is clicked', () => {
    storage[STORAGE_KEY] = 'true';

    render(<EmailVerificationBanner />);
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));

    expect(screen.queryByText(/check your inbox/i)).toBeNull();
    expect(storage[STORAGE_KEY]).toBeUndefined();
  });
});
