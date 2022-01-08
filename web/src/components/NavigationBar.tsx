/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from "react";
import Backend from "../lib/Backend";
import NotionWorkspace from "../lib/interfaces/NotionWorkspace";
import BetaTag from "./BetaTag";

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

let backend = new Backend();
const NavigationBar = (props: NavigationBarProps) => {
  const [waiting, setIsWaiting] = useState(false);
  const isSignedIn = getCookie("token");
  const [active, setHamburgerMenu] = useState(false);
  const path = window.location.pathname;

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="main navigation">
        <div className="navbar-brand">
          <div className="navbar-item has-text-weight-bold">
            <div className="mx-2">
              <BetaTag />
            </div>
            <a href="/">2anki</a>
          </div>
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
              <div className="navbar-item">
                <div className="buttons">
                  <a href="/login#register" className="button is-black">
                    <strong>Join waitlist</strong>
                  </a>
                  <a href="/login#login" className="button is-light">
                    Beta access
                  </a>
                </div>
              </div>
            </div>
          )}
          {isSignedIn && (
            <>
              <div className="navbar-end">
                <a
                  style={{
                    borderBottom: path.includes("/search")
                      ? "3px solid #5397f5"
                      : "",
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
      </nav>
    </>
  );
};

export default NavigationBar;
