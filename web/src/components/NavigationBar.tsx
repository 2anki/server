import { useState } from "react";
import Backend from "../lib/Backend";
import NotionWorkspace from "../lib/interfaces/NotionWorkspace";
interface NavigationBarProps {
  isSignedIn: boolean;
  workspaces?: NotionWorkspace[];
  activeWorkspace?: string;
  connectLink?: string;
}

let backend = new Backend();
const NavigationBar = (props: NavigationBarProps) => {
  const [waiting, setIsWaiting] = useState(false);
  return (
    <>
      <nav
        className="navbar  is-fixed-top"
        role="navigation"
        aria-label="main navigation"
      >
        <div className="navbar-brand">
          <a className="navbar-item" href="https://bulma.io">
            <img
              alt="2anki logo"
              src="icons/2anki-logo.png"
              width="112"
              height="28"
            />
          </a>
        </div>

        <div className="navbar-start">
          <div className="navbar-item has-dropdown is-hoverable">
            {props.activeWorkspace && (
              <>
                <a href="#" key={props.activeWorkspace} className="navbar-link">
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
              {props.isSignedIn && (
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
          {props.isSignedIn && (
            <>
              <a href="/tm" className="navbar-item">
                Templates
              </a>
              <a href="/new-deck" className="navbar-item">
                New deck
              </a>
            </>
          )}
          {!props.isSignedIn && (
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
