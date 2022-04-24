/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from 'react';

import getNavbarStartNewUser from './helpers/getNavbarStartNewUser';
import NavButtonCTA from '../buttons/NavButtonCTA';
import getCookie from './helpers/getCookie';
import Backend from '../../lib/Backend';
import NavbarItem from './NavbarItem';
import { Navbar } from './styled';
import getNavbarStartRegularUser from './helpers/getNavbarStartRegularUser';
import getNavbarEnd from './helpers/getNavbarEnd';

const backend = new Backend();
// eslint-disable-next-line import/prefer-default-export
export function NavigationBar() {
  const isSignedIn = getCookie('token');
  const [active, setHamburgerMenu] = useState(false);
  const path = window.location.pathname;
  const { hash } = window.location;

  const navbarStart = isSignedIn
    ? getNavbarStartRegularUser(hash)
    : getNavbarStartNewUser(hash, path);

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
        <div className="navbar-start">{navbarStart}</div>
        {!isSignedIn && (
          <div className="navbar-end">
            <NavbarItem path="login" href="/login#login">
              Login
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
        {isSignedIn && getNavbarEnd(path, backend)}
      </div>
    </Navbar>
  );
}

NavigationBar.defaultProps = {
  workspaces: [],
  activeWorkspace: '',
  connectLink: null,
};
