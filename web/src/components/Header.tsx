import styled from "styled-components";

const Title = styled.h1`
  font-size: 1rem;
  font-weight: bold;
  padding-left: 0;
`;

const StyledHeader = styled.header`
  flex-shrink: 0;
`;

const NavBar = styled.nav`
  padding: 1rem;
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;
const Buttons = styled.div`
  display: flex;
  justify-content: space-between;
  width: 50%;
  grid-gap: 1rem;
  max-width: 200px;
  flex-direction: column;
  @media (min-width: 1024px) {
    flex-direction: row;
  }
`;

const Header = () => {
  return (
    <StyledHeader>
      <NavBar>
        <div>
          <a href="/">
            <Title>2anki.net</Title>
          </a>
        </div>
        <Buttons>
          <a
            className="button is-danger is-light"
            rel="noreferrer"
            target="_blank"
            href="https://www.patreon.com/alemayhu"
          >
            <span style={{ fontWeight: "bold" }}>🧡 &nbsp;Become a Patron</span>
          </a>
          <a
            className="button is-info is-light"
            rel="noreferrer"
            target="_blank"
            href="https://github.com/sponsors/alemayhu"
          >
            <span style={{ fontWeight: "bold" }}>💙 &nbsp;Sponsor</span>
          </a>
        </Buttons>
      </NavBar>
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
