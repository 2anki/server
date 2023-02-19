/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from 'react';
import { useCookies } from 'react-cookie';

import getNavbarStartNewUser from './helpers/getNavbarStartNewUser';
import NavButtonCTA from '../buttons/NavButtonCTA';
import Backend from '../../lib/backend';
import NavbarItem from './NavbarItem';
import { Navbar } from './styled';
import getNavbarStartRegularUser from './helpers/getNavbarStartRegularUser';
import getNavbarEnd from './helpers/getNavbarEnd';
import { canShowNavbar } from '../shared/canShowNavbar';

const backend = new Backend();

function NavigationBar() {
  const [cookies] = useCookies(['token']);
  const [active, setHamburgerMenu] = useState(false);
  const path = window.location.pathname;
  const { hash } = window.location;

  const navbarStart = cookies.token
    ? getNavbarStartRegularUser(hash)
    : getNavbarStartNewUser(hash, path);

  if (!canShowNavbar(path)) {
    return null;
  }

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
        {!cookies.token && (
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
        {cookies.token && getNavbarEnd(path, backend)}
      </div>
    </Navbar>
  );
}

export default NavigationBar;
