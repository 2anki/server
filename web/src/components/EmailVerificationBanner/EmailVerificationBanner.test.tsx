import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { EmailVerificationBanner } from './EmailVerificationBanner';

describe('EmailVerificationBanner', () => {
  it('renders when emailVerified is false', () => {
    render(
      <EmailVerificationBanner
        emailVerified={false}
        email="al@example.com"
        onResend={vi.fn()}
      />
    );

    expect(screen.getByText(/verify your email/i)).toBeTruthy();
    expect(screen.getByText(/al@example.com/)).toBeTruthy();
  });

  it('does not render when emailVerified is true', () => {
    render(
      <EmailVerificationBanner
        emailVerified={true}
        email="al@example.com"
        onResend={vi.fn()}
      />
    );

    expect(screen.queryByText(/verify your email/i)).toBeNull();
  });

  it('calls onResend and shows sent state after click', async () => {
    const onResend = vi.fn().mockResolvedValue(undefined);

    render(
      <EmailVerificationBanner
        emailVerified={false}
        email="al@example.com"
        onResend={onResend}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /resend email/i }));
    });

    expect(onResend).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/sent — check your inbox/i)).toBeTruthy();
  });

  it('shows rate-limited state when onResend rejects', async () => {
    const onResend = vi.fn().mockRejectedValue(new Error('rate limited'));

    render(
      <EmailVerificationBanner
        emailVerified={false}
        email="al@example.com"
        onResend={onResend}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /resend email/i }));
    });

    expect(screen.getByText(/try again in a minute/i)).toBeTruthy();
  });

  it('shows dismiss button only after resend is clicked', async () => {
    const onResend = vi.fn().mockResolvedValue(undefined);

    render(
      <EmailVerificationBanner
        emailVerified={false}
        email="al@example.com"
        onResend={onResend}
      />
    );

    expect(screen.queryByRole('button', { name: /dismiss/i })).toBeNull();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /resend email/i }));
    });

    expect(screen.getByRole('button', { name: /dismiss/i })).toBeTruthy();
  });

  it('hides banner when dismiss is clicked after resend', async () => {
    const onResend = vi.fn().mockResolvedValue(undefined);

    render(
      <EmailVerificationBanner
        emailVerified={false}
        email="al@example.com"
        onResend={onResend}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /resend email/i }));
    });
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));

    expect(screen.queryByText(/verify your email/i)).toBeNull();
  });
});
