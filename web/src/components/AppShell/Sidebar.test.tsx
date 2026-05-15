import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';

vi.mock('../../lib/backend/getCardUsage', () => ({
  getCardUsage: vi.fn().mockResolvedValue({
    cards_used: 23,
    cards_limit: 100,
    unlimited: false,
  }),
}));

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

describe('Sidebar convert group', () => {
  it('renders Upload, My Decks, and Notion to Anki for every logged-in user', () => {
    renderSidebar();
    expect(screen.getByRole('link', { name: 'Make flashcards' })).toHaveAttribute(
      'href',
      '/upload'
    );
    expect(screen.getByRole('link', { name: 'My Decks' })).toHaveAttribute(
      'href',
      '/downloads'
    );
    expect(
      screen.getByRole('link', { name: 'Notion to Anki' })
    ).toHaveAttribute('href', '/notion');
  });

  it('shows Print locked with a Subscriber pill for free users', () => {
    renderSidebar();
    const locked = screen.getByRole('button', {
      name: /Print Decks — upgrade to unlock/i,
    });
    expect(locked).toBeInTheDocument();
    expect(locked).toHaveTextContent('Subscriber');
  });

  it('navigates to /pricing?from=print when the locked Print row is clicked', () => {
    function LocationProbe() {
      const location = useLocation();
      return <div data-testid="path">{location.pathname + location.search}</div>;
    }
    render(
      <MemoryRouter initialEntries={['/upload']}>
        <Sidebar
          email="x@y.z"
          locals={{ patreon: false, subscriber: false }}
          features={{}}
          onLogOut={vi.fn()}
        />
        <Routes>
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    );
    fireEvent.click(
      screen.getByRole('button', { name: /Print Decks — upgrade to unlock/i })
    );
    expect(screen.getByTestId('path')).toHaveTextContent(
      '/pricing?from=print'
    );
  });

  it('shows Print as a real link for paying users', () => {
    renderSidebar({ subscriber: true });
    expect(screen.getByRole('link', { name: 'Print Decks' })).toHaveAttribute(
      'href',
      '/print'
    );
    expect(
      screen.queryByRole('button', { name: /Print Decks — upgrade to unlock/i })
    ).not.toBeInTheDocument();
  });

  it('hides Auto Sync when the user does not have patreon access', () => {
    renderSidebar({ subscriber: true });
    expect(
      screen.queryByRole('link', { name: 'Auto Sync' })
    ).not.toBeInTheDocument();
  });

  it('shows Auto Sync when the user has patreon access', () => {
    renderSidebar({ patreon: true });
    expect(screen.getByRole('link', { name: 'Auto Sync' })).toHaveAttribute(
      'href',
      '/ankify'
    );
  });
});

describe('Sidebar your-stuff group', () => {
  it('shows Settings for every logged-in user', () => {
    renderSidebar();
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute(
      'href',
      '/card-options'
    );
  });

  it('marks Settings active on /card-options', () => {
    renderSidebar({ pathname: '/card-options' });
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });
});

describe('Sidebar help group', () => {
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

  it('does not render a Billing row for paying users', () => {
    renderSidebar({ patreon: true });
    expect(
      screen.queryByRole('link', { name: 'Billing' })
    ).not.toBeInTheDocument();
  });
});

describe('Sidebar admin group', () => {
  it('hides the admin group when no flags are on', () => {
    renderSidebar();
    expect(
      screen.queryByRole('link', { name: 'KI' })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Ops' })).not.toBeInTheDocument();
  });

  it('shows KI when kiUI is on', () => {
    renderSidebar({ kiUI: true });
    expect(
      screen.getByRole('link', { name: 'KI' })
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
    expect(screen.getByText('Lifetime')).toBeInTheDocument();
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
  it('marks the My Decks row active on /downloads', () => {
    renderSidebar({ pathname: '/downloads' });
    expect(screen.getByRole('link', { name: 'My Decks' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByRole('link', { name: 'Make flashcards' })).not.toHaveAttribute(
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

  it('marks the My Decks row active on a /downloads sub-route', () => {
    renderSidebar({ pathname: '/downloads/123' });
    expect(screen.getByRole('link', { name: 'My Decks' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });
});

describe('Sidebar group hierarchy', () => {
  it('does not render group labels', () => {
    renderSidebar();
    expect(screen.queryByText('Make')).not.toBeInTheDocument();
    expect(screen.queryByText('Learn')).not.toBeInTheDocument();
  });

  it('omits the Admin group label when no admin flags are on', () => {
    renderSidebar();
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('does not render Admin group label even when ops is on', () => {
    renderSidebar({ ops: true });
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });
});

describe('Sidebar cards-used counter', () => {
  it('renders the counter for free users with the fetched usage', async () => {
    renderSidebar();
    await waitFor(() =>
      expect(screen.getByText('23')).toBeInTheDocument()
    );
    expect(
      screen.getByText('/ 100 cards this month')
    ).toBeInTheDocument();
  });

  it('does not render the counter for paying users', async () => {
    renderSidebar({ subscriber: true });
    await new Promise((r) => setTimeout(r, 10));
    expect(
      screen.queryByText('/ 100 cards this month')
    ).not.toBeInTheDocument();
  });
});

describe('Sidebar More block', () => {
  it('renders the footer links', () => {
    renderSidebar();
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute(
      'href',
      '/about'
    );
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute(
      'href',
      '/contact'
    );
    expect(screen.getByRole('link', { name: 'Terms' })).toHaveAttribute(
      'href',
      '/documentation/misc/terms-of-service'
    );
    expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute(
      'href',
      '/documentation/misc/privacy-policy'
    );
  });
});
