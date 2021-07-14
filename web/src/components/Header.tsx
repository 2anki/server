import styled from "styled-components";

const Title = styled.h1`
  font-size: 2rem;
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

const Header = () => {
  return (
    <StyledHeader>
      <NavBar>
        <div>
          <a href="/">
            <Title>2anki.net</Title>
          </a>
        </div>
      </NavBar>
    </StyledHeader>
  );
};

export default Header;
