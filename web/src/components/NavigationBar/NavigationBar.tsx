/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from 'react';

import NotionWorkspace from '../../lib/interfaces/NotionWorkspace';
import NavButtonCTA from '../buttons/NavButtonCTA';
import getCookie from './helpers/getCookie';
import Backend from '../../lib/Backend';
import NavbarItem from './NavbarItem';
import { Navbar } from './styled';

interface NavigationBarProps {
  workspaces?: NotionWorkspace[];
  activeWorkspace?: string;
  connectLink?: string;
}

const backend = new Backend();
// eslint-disable-next-line import/prefer-default-export
export function NavigationBar({
  activeWorkspace,
  workspaces,
  connectLink,
}: NavigationBarProps) {
  const isSignedIn = getCookie('token');
  const [active, setHamburgerMenu] = useState(false);
  const path = window.location.pathname;
  const { hash } = window.location;

  return (
    <Navbar className="navbar" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <a className="navbar-item has-text-weight-bold" href="/">
          <img src="/mascot/navbar-logo.png" alt="2anki Logo" />
        </a>
        <a
          role="button"
          className="navbar-burger"
          aria-label="menu"
          aria-expanded="false"
          onKeyDown={() => setHamburgerMenu(!active)}
          onClick={() => setHamburgerMenu(!active)}
          tabIndex={0}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </a>
      </div>

      <div id="navbar" className={`navbar-menu ${active ? 'is-active' : ''}`}>
        <div className="navbar-start">
          <div className="navbar-item has-dropdown is-hoverable">
            {activeWorkspace && (
              <a href="/search" key={activeWorkspace} className="navbar-link">
                {activeWorkspace}
              </a>
            )}
            <div className="navbar-dropdown">
              {workspaces && (
                <>
                  {workspaces.map((w) => (
                    <a
                      key={w.name}
                      href="/notion/switch-workspace"
                      className="navbar-item"
                    >
                      {w.name}
                    </a>
                  ))}
                  <hr className="navbar-divider" />
                </>
              )}
              {connectLink && (
                <a href={connectLink} className="dropdown-item">
                  Connect workspace
                </a>
              )}
            </div>
          </div>
        </div>

        {!isSignedIn && (
          <div className="navbar-end">
            <NavbarItem href="/" path={hash || path}>
              Home
            </NavbarItem>
            <NavbarItem href="/#about" path={hash}>
              About
            </NavbarItem>
            <NavbarItem href="/#testimony" path={hash}>
              Testimony
            </NavbarItem>
            <NavbarItem href="/#benefits" path={hash}>
              Benefits
            </NavbarItem>
            <NavbarItem href="/#news" path={hash}>
              News
            </NavbarItem>
            <div className="navbar-item">
              <div className="buttons">
                <NavButtonCTA href="/login#register">
                  <strong>Join Now</strong>
                </NavButtonCTA>
              </div>
            </div>
          </div>
        )}
        {isSignedIn && (
          <div className="navbar-end">
            <NavbarItem href="/upload" path={path}>
              📦 Upload
            </NavbarItem>
            <NavbarItem href="/search" path={path}>
              🔍 Search
            </NavbarItem>
            <NavbarItem href="/uploads/mine" path={path}>
              🗄 Uploads
            </NavbarItem>
            <NavbarItem
              path={path}
              href="/users/logout"
              onClick={(event) => {
                event.preventDefault();
                backend.logout();
              }}
            >
              🔒 log out
            </NavbarItem>
          </div>
        )}
      </div>
    </Navbar>
  );
}

NavigationBar.defaultProps = {
  workspaces: [],
  activeWorkspace: '',
  connectLink: null,
};
