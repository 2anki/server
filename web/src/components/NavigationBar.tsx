/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from "react";
import styled from "styled-components";

import Backend from "../lib/Backend";
import NotionWorkspace from "../lib/interfaces/NotionWorkspace";
import NavButtonCTA from "./buttons/NavButtonCTA";

// https://www.w3schools.com/js/js_cookies.asp
function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

interface NavigationBarProps {
  workspaces?: NotionWorkspace[];
  activeWorkspace?: string;
  connectLink?: string;
}

const Navbar = styled.nav`
  padding: 2rem 4rem 2rem 4rem;
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

const NavbarItem = ({ path, href, children }) => {
  return (
    <StyledNavbarItem
      href={href}
      className={`navbar-item ${path === href ? "has-text-weight-bold" : ""}`}
    >
      {children}
    </StyledNavbarItem>
  );
};

let backend = new Backend();
const NavigationBar = (props: NavigationBarProps) => {
  const [waiting, setIsWaiting] = useState(false);
  const isSignedIn = getCookie("token");
  const [active, setHamburgerMenu] = useState(false);
  const path = window.location.pathname;
  const hash = window.location.hash;

  return (
    <>
      <Navbar className="navbar" role="navigation" aria-label="main navigation">
        <div className="navbar-brand">
          <a className="navbar-item has-text-weight-bold" href="/">
            <img src="/mascot/navbar-logo.png" alt="2anki Logo" />
          </a>
          <a
            role="button"
            className={`navbar-burger burger ${active ? "is-active" : ""}`}
            aria-label="menu"
            aria-expanded="false"
            data-target="navbar"
            onClick={() => setHamburgerMenu(!active)}
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>

        <div id="navbar" className={`navbar-menu ${active ? "is-active" : ""}`}>
          <div className="navbar-start">
            <div className="navbar-item has-dropdown is-hoverable">
              {props.activeWorkspace && (
                <>
                  <a
                    href="/search"
                    key={props.activeWorkspace}
                    className="navbar-link"
                  >
                    {props.activeWorkspace}
                  </a>
                </>
              )}
              <div className="navbar-dropdown">
                {props.workspaces && (
                  <>
                    {props.workspaces.map((w) => (
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
                {props.connectLink && (
                  <a href={props.connectLink} className="dropdown-item">
                    Connect workspace
                  </a>
                )}
                <a className="navbar-item" href="mailto:alexander@alemayhu.com">
                  Report an issue
                </a>
                {isSignedIn && (
                  <div className="dropdown-item">
                    <button
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
              <NavbarItem href="/" path={hash ? hash : path}>
                Home
              </NavbarItem>
              <NavbarItem href="#about" path={hash}>
                About
              </NavbarItem>
              <NavbarItem href="#testimony" path={hash}>
                Testimony
              </NavbarItem>
              <NavbarItem href="#benefits" path={hash}>
                Benefits
              </NavbarItem>
              <NavbarItem href="#news" path={hash}>
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
            <>
              <div className="navbar-end">
                <a
                  style={{
                    fontWeight: path.includes("/search") ? "bold" : "normal",
                  }}
                  href="/search"
                  className="navbar-item"
                >
                  Search
                </a>
                <a
                  style={{
                    borderBottom: path.includes("/uploads/mine")
                      ? "3px solid #5397f5"
                      : "",
                  }}
                  href="/uploads/mine"
                  className="navbar-item"
                >
                  Uploads
                </a>
              </div>
            </>
          )}
        </div>
      </Navbar>
    </>
  );
};

export default NavigationBar;
