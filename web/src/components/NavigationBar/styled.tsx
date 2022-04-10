import styled from 'styled-components';

export const Navbar = styled.nav`
  background: #E5E5E5;
  @media (max-width: 1024px) {
    margin: 0;
  }
`;

export const StyledNavbarItem = styled.a`
  font-size: 20px;
  :hover {
    font-weight: bold;
  }
`;
