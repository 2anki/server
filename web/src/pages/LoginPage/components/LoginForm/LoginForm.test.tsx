import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';
import LoginForm from './index';

vi.mock('../../../../lib/backend/get2ankiApi', () => ({
  get2ankiApi: () => ({
    login: vi.fn().mockResolvedValue({
      status: 200,
      json: () => Promise.resolve({ token: 'test-token' }),
    }),
    requestMagicLink: vi.fn().mockResolvedValue({ ok: true }),
  }),
}));

function renderLoginForm() {
  return render(
    <CookiesProvider>
      <MemoryRouter initialEntries={['/login']}>
        <LoginForm />
      </MemoryRouter>
    </CookiesProvider>
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders email step with email input and continue button', () => {
    renderLoginForm();
    expect(screen.getByText('Log in')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Continue with email' })
    ).toBeInTheDocument();
  });

  it('does not show password field on email step', () => {
    renderLoginForm();
    expect(screen.queryByPlaceholderText('Password')).toBeNull();
  });

  it('shows Google OAuth button on email step', () => {
    renderLoginForm();
    expect(screen.getByText('Log in with Google')).toBeInTheDocument();
  });

  it('transitions to password step after clicking continue', () => {
    renderLoginForm();
    const emailInput = screen.getByPlaceholderText('Email address');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(
      screen.getByRole('button', { name: 'Continue with email' })
    );

    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();
  });

  it('shows change link and forgot password on password step', () => {
    renderLoginForm();
    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Continue with email' })
    );

    expect(screen.getByText('Change')).toBeInTheDocument();
    expect(screen.getByText('Forgot your password?')).toBeInTheDocument();
  });

  it('returns to email step when change is clicked', () => {
    renderLoginForm();
    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Continue with email' })
    );

    fireEvent.click(screen.getByText('Change'));
    expect(
      screen.getByRole('button', { name: 'Continue with email' })
    ).toBeInTheDocument();
  });

  it('shows magic link option on password step', () => {
    renderLoginForm();
    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Continue with email' })
    );

    expect(
      screen.getByText('Send a login link instead')
    ).toBeInTheDocument();
  });

  it('transitions to check-email step after clicking magic link', async () => {
    renderLoginForm();
    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Continue with email' })
    );

    fireEvent.click(screen.getByText('Send a login link instead'));

    await waitFor(() => {
      expect(screen.getByText('Check your email')).toBeInTheDocument();
    });
  });

  it('shows sign up link on every step', () => {
    renderLoginForm();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
    expect(screen.getByText('Sign up').closest('a')).toHaveAttribute(
      'href',
      '/register'
    );
  });

  it('persists email to localStorage on change', () => {
    renderLoginForm();
    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'stored@example.com' },
    });
    expect(localStorage.getItem('email')).toBe('stored@example.com');
  });

  it('restores email from localStorage', () => {
    localStorage.setItem('email', 'saved@example.com');
    renderLoginForm();
    const emailInput = screen.getByPlaceholderText(
      'Email address'
    ) as HTMLInputElement;
    expect(emailInput.value).toBe('saved@example.com');
  });
});
