import { useState } from "react";

import styled from "styled-components";

import CTAButton from "./CTAButton";

const Title = styled.h1`
  font-size: 1rem;
  font-weight: bold;
  padding-left: 0;
`;

const StyledHeader = styled.header`
  flex-shrink: 0;
  nav {
    background: #5386e3;
  }
`;

const Header = () => {
  const [active, setActive] = useState(false);

  return (
    <StyledHeader>
      <nav className="navbar is-link is-fixed-top">
        <div className="navbar-brand">
          <a className="navbar-item" href="/">
            <Title>2anki.net</Title>
          </a>
          <div
            data-target="navbarExampleTransparentExample"
            className={`navbar-burger burger ${active ? "is-active" : null}`}
            onClick={() => setActive(!active)}
          >
            <span />
            <span />
            <span />
          </div>
        </div>
        <div
          id="navbarExampleTransparentExample"
          className={`navbar-menu ${active ? "is-active" : null}`}
        >
          <div className="navbar-start">
            <div className="navbar-item">
              <CTAButton
                destination="/upload"
                text={"Create"}
                isLarge={false}
              />
            </div>
            <a
              className="navbar-item"
              rel="noreferrer"
              target="_blank"
              href="https://www.notion.so/alemayhu/Benefits-0d5fa2e18a8a44d782c72945b2bd413b"
            >
              Benefits
            </a>
            <a
              className="navbar-item"
              rel="noreferrer"
              target="_blank"
              href="https://www.notion.so/alemayhu/Contact-e76523187cc64961972b3ad4f7cb4c47"
            >
              Contact
            </a>
            <a
              className="navbar-item"
              rel="noreferrer"
              target="_blank"
              href="https://www.notion.so/alemayhu/FAQ-ef01be9c9bac41689a4d749127c14301"
            >
              FAQ
            </a>
            <a
              className="navbar-item"
              rel="noreferrer"
              target="_blank"
              href="https://www.notion.so/alemayhu/Privacy-38c6e8238ac04ea9b2485bf488909fd0"
            >
              Privacy
            </a>
            <a
              className="navbar-item"
              rel="noreferrer"
              target="_blank"
              href="https://www.notion.so/alemayhu/Useful-Links-0f3051946a2d4b71ae31610da76b28a8"
            >
              Useful Links
            </a>
            <a
              className="navbar-item"
              rel="noreferrer"
              target="_blank"
              href="https://github.com/alemayhu/notion2anki"
            >
              Code
            </a>
          </div>
          <div className="navbar-end">
            <div className="navbar-item">
              <a
                className="button is-danger is-light"
                rel="noreferrer"
                target="_blank"
                href="https://www.patreon.com/alemayhu"
              >
                <span style={{ fontWeight: "bold" }}>
                  🧡 &nbsp;Become a Patron
                </span>
              </a>
            </div>
            <div className="navbar-item">
              <a
                className="button is-info is-light"
                rel="noreferrer"
                target="_blank"
                href="https://github.com/sponsors/alemayhu"
              >
                <span style={{ fontWeight: "bold" }}>💙 &nbsp;Sponsor</span>
              </a>
            </div>
          </div>
        </div>
      </nav>
    </StyledHeader>
  );
};

export default Header;
