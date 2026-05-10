import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppShell } from './AppShell';

interface RenderOpts {
  pathname?: string;
  isLoggedIn: boolean | undefined;
}

function renderShell({ pathname = '/', isLoggedIn }: RenderOpts) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <AppShell
        isLoggedIn={isLoggedIn}
        email="alexander@alemayhu.com"
        locals={{ patreon: false, subscriber: false }}
        features={{ kiUI: false, ops: false }}
      >
        <div data-testid="page-content">page</div>
      </AppShell>
    </MemoryRouter>
  );
}

describe('AppShell layout switch', () => {
  it('renders the top-bar navigation for anonymous visitors', () => {
    renderShell({ isLoggedIn: false, pathname: '/' });
    expect(screen.getByRole('navigation', { name: /main/i })).toBeInTheDocument();
    expect(screen.queryByTestId('app-sidebar')).not.toBeInTheDocument();
  });

  it('renders the sidebar layout for logged-in users on app routes', () => {
    renderShell({ isLoggedIn: true, pathname: '/upload' });
    expect(screen.getByTestId('app-sidebar')).toBeInTheDocument();
    expect(
      screen.queryByRole('navigation', { name: /main/i })
    ).not.toBeInTheDocument();
  });

  it('forces the top-bar layout on /login even when logged in', () => {
    renderShell({ isLoggedIn: true, pathname: '/login' });
    expect(screen.queryByTestId('app-sidebar')).not.toBeInTheDocument();
  });

  it('forces the top-bar layout on /register even when logged in', () => {
    renderShell({ isLoggedIn: true, pathname: '/register' });
    expect(screen.queryByTestId('app-sidebar')).not.toBeInTheDocument();
  });

  it('forces the top-bar layout on /forgot even when logged in', () => {
    renderShell({ isLoggedIn: true, pathname: '/forgot' });
    expect(screen.queryByTestId('app-sidebar')).not.toBeInTheDocument();
  });

  it('forces the top-bar layout on a password reset link even when logged in', () => {
    renderShell({ isLoggedIn: true, pathname: '/users/r/abc-123' });
    expect(screen.queryByTestId('app-sidebar')).not.toBeInTheDocument();
  });

  it('always renders the page content', () => {
    renderShell({ isLoggedIn: true, pathname: '/upload' });
    expect(screen.getByTestId('page-content')).toBeInTheDocument();
  });
});
