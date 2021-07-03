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
`;

const Header = () => {
  const [active, setActive] = useState(false);

  return (
    <StyledHeader>
      <nav className="navbar">
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
                onClickLink={() => setActive(false)}
              />
            </div>
          </div>
          <div className="navbar-end">
            <a
              className="navbar-item"
              rel="noreferrer"
              target="_blank"
              href="https://www.notion.so/alemayhu/Useful-Links-0f3051946a2d4b71ae31610da76b28a8"
            >
              Useful Links
            </a>
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
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-9593032741719801"
        data-ad-slot="7148911174"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </StyledHeader>
  );
};

export default Header;
