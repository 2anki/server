import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { AvatarMenu } from './AvatarMenu';

interface RenderOpts {
  patreon?: boolean;
  subscriber?: boolean;
  kiUI?: boolean;
  ops?: boolean;
  email?: string | null;
}

function renderMenu({
  patreon = false,
  subscriber = false,
  kiUI = false,
  ops = false,
  email = 'alexander@alemayhu.com',
}: RenderOpts = {}) {
  const onLogOut = vi.fn();
  const utils = render(
    <AvatarMenu
      email={email}
      locals={{ patreon, subscriber }}
      features={{ kiUI, ops }}
      onLogOut={onLogOut}
    />
  );
  return { ...utils, onLogOut };
}

function openAvatar() {
  fireEvent.click(screen.getByRole('button', { name: /account menu/i }));
}

describe('AvatarMenu trigger', () => {
  it('renders the avatar initial from the email local-part', () => {
    renderMenu({ email: 'jane.doe@example.com' });
    expect(
      screen.getByRole('button', { name: /account menu/i })
    ).toHaveTextContent('J');
  });

  it('falls back to ? when email is null', () => {
    renderMenu({ email: null });
    expect(
      screen.getByRole('button', { name: /account menu/i })
    ).toHaveTextContent('?');
  });

  it('aria-expanded reflects open state', () => {
    renderMenu();
    const button = screen.getByRole('button', { name: /account menu/i });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('aria-haspopup is "menu"', () => {
    renderMenu();
    expect(
      screen.getByRole('button', { name: /account menu/i })
    ).toHaveAttribute('aria-haspopup', 'menu');
  });
});

describe('AvatarMenu plan label', () => {
  it('shows Patreon for patreon users', () => {
    renderMenu({ patreon: true });
    openAvatar();
    expect(screen.getByText('Patreon')).toBeInTheDocument();
  });

  it('shows Hosted Anki for stripe subscribers', () => {
    renderMenu({ subscriber: true });
    openAvatar();
    expect(screen.getByText('Hosted Anki')).toBeInTheDocument();
  });

  it('shows Free for users with no plan flags', () => {
    renderMenu();
    openAvatar();
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('prefers Patreon when both flags are set', () => {
    renderMenu({ patreon: true, subscriber: true });
    openAvatar();
    expect(screen.getByText('Patreon')).toBeInTheDocument();
    expect(screen.queryByText('Hosted Anki')).not.toBeInTheDocument();
  });
});

describe('AvatarMenu items', () => {
  it('shows Account always', () => {
    renderMenu();
    openAvatar();
    const menu = screen.getByRole('menu');
    expect(
      within(menu).getByRole('menuitem', { name: 'Account' })
    ).toBeInTheDocument();
  });

  it('shows Billing only for paying users', () => {
    renderMenu({ subscriber: true });
    openAvatar();
    const menu = screen.getByRole('menu');
    expect(
      within(menu).getByRole('menuitem', { name: 'Billing' })
    ).toBeInTheDocument();
  });

  it('hides Billing for free users', () => {
    renderMenu();
    openAvatar();
    const menu = screen.getByRole('menu');
    expect(
      within(menu).queryByRole('menuitem', { name: 'Billing' })
    ).not.toBeInTheDocument();
  });

  it('does not render Docs inside the avatar menu', () => {
    renderMenu();
    openAvatar();
    const menu = screen.getByRole('menu');
    expect(within(menu).queryByText('Docs')).not.toBeInTheDocument();
    expect(within(menu).queryByText('Documentation')).not.toBeInTheDocument();
  });

  it('does not render Ankify inside the avatar menu', () => {
    renderMenu({ patreon: true });
    openAvatar();
    const menu = screen.getByRole('menu');
    expect(within(menu).queryByText('Ankify')).not.toBeInTheDocument();
  });

  it('renders the Experiments subhead and KI when feature on', () => {
    renderMenu({ kiUI: true });
    openAvatar();
    expect(screen.getByText('Experiments')).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: /KI \(beta\)/i })
    ).toBeInTheDocument();
  });

  it('hides the Experiments subhead when no experiments are entitled', () => {
    renderMenu();
    openAvatar();
    expect(screen.queryByText('Experiments')).not.toBeInTheDocument();
  });

  it('renders the Admin subhead and Ops when feature on', () => {
    renderMenu({ ops: true });
    openAvatar();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Ops' })).toBeInTheDocument();
  });

  it('hides the Admin subhead when no admin features are entitled', () => {
    renderMenu();
    openAvatar();
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('Log out item is present and triggers the callback', () => {
    const { onLogOut } = renderMenu();
    openAvatar();
    const menu = screen.getByRole('menu');
    const logout = within(menu).getByRole('menuitem', { name: /log out/i });
    fireEvent.click(logout);
    expect(onLogOut).toHaveBeenCalledTimes(1);
  });

  it('closes when Escape is pressed', () => {
    renderMenu();
    openAvatar();
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(
      screen.getByRole('button', { name: /account menu/i })
    ).toHaveAttribute('aria-expanded', 'false');
  });
});
