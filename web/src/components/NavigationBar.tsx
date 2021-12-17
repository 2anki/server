import { useState } from "react";
import Backend from "../lib/Backend";
import NotionWorkspace from "../lib/interfaces/NotionWorkspace";

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

  return (
    <>
      <nav
        className="navbar  is-fixed-top"
        role="navigation"
        aria-label="main navigation"
      >
        <div className="navbar-brand">
          <a className="navbar-item has-text-weight-bold" href="/">
            2anki
          </a>
        </div>

        <div className="navbar-start">
          <div className="navbar-item has-dropdown is-hoverable">
            {props.activeWorkspace && (
              <>
                <a
                  href="/active-workspace"
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

        <div className="navbar-end">
          {isSignedIn && (
            <>
              {/* <a href="/learn" className="navbar-item">
                💡 Learn
              </a> */}
              <a href="/search" className="navbar-item my-2 mx-4 button">
                🔎
              </a>
            </>
          )}
          {!isSignedIn && (
            <>
              <div className="navbar-item">
                <div className="buttons">
                  <a href="/login#register" className="button is-black">
                    <strong>Register</strong>
                  </a>
                  <a href="/login#login" className="button is-light">
                    Log in
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </nav>
    </>
  );
};

export default NavigationBar;
