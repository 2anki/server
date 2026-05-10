import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from './Sidebar';

interface SidebarRenderOpts {
  pathname?: string;
  patreon?: boolean;
  subscriber?: boolean;
  kiUI?: boolean;
  ops?: boolean;
  email?: string | null;
  onLogOut?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}

function renderSidebar({
  pathname = '/upload',
  patreon = false,
  subscriber = false,
  kiUI = false,
  ops = false,
  email = 'alexander@alemayhu.com',
  onLogOut = vi.fn(),
}: SidebarRenderOpts = {}) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <Sidebar
        email={email}
        locals={{ patreon, subscriber }}
        features={{ kiUI, ops }}
        onLogOut={onLogOut}
      />
    </MemoryRouter>
  );
}

describe('Sidebar work group', () => {
  it('renders Upload, Library, and Search Notion for every logged-in user', () => {
    renderSidebar();
    expect(screen.getByRole('link', { name: 'Upload' })).toHaveAttribute(
      'href',
      '/upload'
    );
    expect(screen.getByRole('link', { name: 'Library' })).toHaveAttribute(
      'href',
      '/downloads'
    );
    expect(
      screen.getByRole('link', { name: 'Search Notion' })
    ).toHaveAttribute('href', '/notion');
  });

  it('hides Ankify when the user does not have patreon access', () => {
    renderSidebar({ subscriber: true });
    expect(
      screen.queryByRole('link', { name: 'Ankify' })
    ).not.toBeInTheDocument();
  });

  it('shows Ankify when the user has patreon access', () => {
    renderSidebar({ patreon: true });
    expect(screen.getByRole('link', { name: 'Ankify' })).toHaveAttribute(
      'href',
      '/ankify'
    );
  });
});

describe('Sidebar reference group', () => {
  it('always shows Docs', () => {
    renderSidebar();
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute(
      'href',
      '/documentation'
    );
  });

  it('shows Pricing only for free users', () => {
    renderSidebar();
    expect(screen.getByRole('link', { name: 'Pricing' })).toHaveAttribute(
      'href',
      '/pricing'
    );
  });

  it('hides Pricing for paying users', () => {
    renderSidebar({ subscriber: true });
    expect(
      screen.queryByRole('link', { name: 'Pricing' })
    ).not.toBeInTheDocument();
  });

  it('shows Billing only for paying users', () => {
    renderSidebar({ patreon: true });
    expect(screen.getByRole('link', { name: 'Billing' })).toHaveAttribute(
      'href',
      '/account'
    );
  });

  it('hides Billing for free users', () => {
    renderSidebar();
    expect(
      screen.queryByRole('link', { name: 'Billing' })
    ).not.toBeInTheDocument();
  });
});

describe('Sidebar admin group', () => {
  it('hides the admin group when no flags are on', () => {
    renderSidebar();
    expect(
      screen.queryByRole('link', { name: /KI \(beta\)/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Ops' })).not.toBeInTheDocument();
  });

  it('shows KI when kiUI is on', () => {
    renderSidebar({ kiUI: true });
    expect(
      screen.getByRole('link', { name: /KI \(beta\)/i })
    ).toHaveAttribute('href', '/ki');
  });

  it('shows Ops when ops is on', () => {
    renderSidebar({ ops: true });
    expect(screen.getByRole('link', { name: 'Ops' })).toHaveAttribute(
      'href',
      '/ops'
    );
  });
});

describe('Sidebar identity block', () => {
  it('renders the email and plan label', () => {
    renderSidebar({ email: 'alexander@alemayhu.com', patreon: true });
    expect(screen.getByText('alexander@alemayhu.com')).toBeInTheDocument();
    expect(screen.getByText('Patreon')).toBeInTheDocument();
  });

  it('shows Free when neither plan flag is set', () => {
    renderSidebar();
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('renders Account and Log out as first-class rows', () => {
    renderSidebar();
    expect(screen.getByRole('link', { name: 'Account' })).toHaveAttribute(
      'href',
      '/account'
    );
    expect(
      screen.getByRole('link', { name: /log out/i })
    ).toBeInTheDocument();
  });

  it('fires onLogOut when the Log out row is clicked', () => {
    const onLogOut = vi.fn();
    renderSidebar({ onLogOut });
    fireEvent.click(screen.getByRole('link', { name: /log out/i }));
    expect(onLogOut).toHaveBeenCalledTimes(1);
  });
});

describe('Sidebar active state', () => {
  it('marks the Library row active on /downloads', () => {
    renderSidebar({ pathname: '/downloads' });
    expect(screen.getByRole('link', { name: 'Library' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByRole('link', { name: 'Upload' })).not.toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('marks the Account row active on /account', () => {
    renderSidebar({ pathname: '/account' });
    expect(screen.getByRole('link', { name: 'Account' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('marks the Library row active on a /downloads sub-route', () => {
    renderSidebar({ pathname: '/downloads/123' });
    expect(screen.getByRole('link', { name: 'Library' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });
});
