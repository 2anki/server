import styled from 'styled-components';

export const StyledButton = styled.div`
  margin-top: 0.5rem;
  margin-bottom: 2rem;
  background: #5397f5;
  padding: 1rem 1.9rem;
  border-radius: 3px;
  text-transform: uppercase;
  width: 268px;
  height: 66px;
  display: flex;
  grid-gap: 0.7rem;
  align-items: center;
  justify-content: center;
  a {
    text-decoration: none;
    color: white;
  }
  &:hover {
    background-color: #2b2e3c;
  }

  /* Typography */
  font-family: Rubik;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: 30px;
  letter-spacing: 0em;
  text-align: center;

  @media (max-width: 1024px) {
    font-size: 16px;
    height: 54px;
    margin-right: auto;
  }
`;
