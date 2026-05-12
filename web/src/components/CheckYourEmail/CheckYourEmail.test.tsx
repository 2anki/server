import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import CheckYourEmail from './CheckYourEmail';

describe('CheckYourEmail', () => {
  it('renders login purpose copy', () => {
    render(
      <CheckYourEmail
        email="user@example.com"
        onRetry={vi.fn()}
        purpose="login"
      />
    );
    expect(screen.getByText('Check your email')).toBeInTheDocument();
    expect(screen.getByText(/login link/)).toBeInTheDocument();
    expect(screen.getByText(/log in/)).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });

  it('renders password_reset purpose copy', () => {
    render(
      <CheckYourEmail
        email="user@example.com"
        onRetry={vi.fn()}
        purpose="password_reset"
      />
    );
    expect(screen.getByText(/password reset link/)).toBeInTheDocument();
    expect(screen.getByText(/reset your password/)).toBeInTheDocument();
  });

  it('shows Gmail link for gmail.com addresses', () => {
    render(
      <CheckYourEmail
        email="user@gmail.com"
        onRetry={vi.fn()}
        purpose="login"
      />
    );
    const gmailLink = screen.getByRole('link', { name: 'Open Gmail' });
    expect(gmailLink).toHaveAttribute('href', 'https://mail.google.com');
    expect(gmailLink).toHaveAttribute('target', '_blank');
  });

  it('shows Outlook link for hotmail.com addresses', () => {
    render(
      <CheckYourEmail
        email="user@hotmail.com"
        onRetry={vi.fn()}
        purpose="login"
      />
    );
    expect(
      screen.getByRole('link', { name: 'Open Outlook' })
    ).toHaveAttribute('href', 'https://outlook.live.com');
  });

  it('shows Yahoo link for yahoo.com addresses', () => {
    render(
      <CheckYourEmail
        email="user@yahoo.com"
        onRetry={vi.fn()}
        purpose="login"
      />
    );
    expect(
      screen.getByRole('link', { name: 'Open Yahoo Mail' })
    ).toHaveAttribute('href', 'https://mail.yahoo.com');
  });

  it('shows no provider links for unknown domains', () => {
    render(
      <CheckYourEmail
        email="user@company.com"
        onRetry={vi.fn()}
        purpose="login"
      />
    );
    expect(screen.queryByRole('link', { name: /Open/ })).toBeNull();
  });

  it('calls onRetry when the try again link is clicked', () => {
    const onRetry = vi.fn();
    render(
      <CheckYourEmail
        email="user@example.com"
        onRetry={onRetry}
        purpose="login"
      />
    );
    fireEvent.click(screen.getByText('try again'));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
