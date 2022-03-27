/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from 'react';
import styled from 'styled-components';

import Backend from '../lib/Backend';
import NotionWorkspace from '../lib/interfaces/NotionWorkspace';
import NavButtonCTA from './buttons/NavButtonCTA';

// https://www.w3schools.com/js/js_cookies.asp
function getCookie(cname) {
  const name = `${cname}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i += 1) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

interface NavigationBarProps {
  workspaces?: NotionWorkspace[];
  activeWorkspace?: string;
  connectLink?: string;
}

const Navbar = styled.nav`
  background #E5E5E5;
  @media (max-width: 1024px) {
    margin: 0;
  }
`;

const StyledNavbarItem = styled.a`
  font-size: 20px;
  :hover {
    font-weight: bold;
  }
`;

interface NavbarItemProps {
  path: string;
  href: string;
  children: React.ReactNode;
}

function NavbarItem({ path, href, children }: NavbarItemProps) {
  return (
    <StyledNavbarItem
      href={href}
      className={`navbar-item ${path === href ? 'has-text-weight-bold' : ''}`}
    >
      {children}
    </StyledNavbarItem>
  );
}

const backend = new Backend();
function NavigationBar({ activeWorkspace, workspaces, connectLink }: NavigationBarProps) {
  const [waiting, setIsWaiting] = useState(false);
  const isSignedIn = getCookie('token');
  const [active, setHamburgerMenu] = useState(false);
  const path = window.location.pathname;
  const { hash } = window.location;

  return (
    <Navbar className="navbar" role="navigation" aria-label="main navigation" onClick={() => setHamburgerMenu(true)}>
      <div className="navbar-brand">
        <a className="navbar-item has-text-weight-bold" href="/">
          <img src="/mascot/navbar-logo.png" alt="2anki Logo" />
        </a>
        <a
          href="/search"
          className="navbar-item"
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
            <a
              href="/search"
              key={activeWorkspace}
              className="navbar-link"
            >
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
              <a className="navbar-item" href="mailto:alexander@alemayhu.com">
                Report an issue
              </a>
              {isSignedIn && (
              <div className="dropdown-item">
                <button
                  type="button"
                  onClick={() => {
                    if (!waiting) {
                      setIsWaiting(true);
                      backend.logout();
                    }
                  }}
                  className="button is-small navbar-item"
                >
                  Log out
                </button>
              </div>
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
          <NavbarItem href="/search" path={path}>
            Search
          </NavbarItem>
          <NavbarItem href="/uploads/mine" path={path}>
            Uploads
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

export default NavigationBar;
