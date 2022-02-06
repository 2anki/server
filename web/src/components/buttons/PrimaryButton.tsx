import styled from "styled-components";

import { Link } from "react-router-dom";

const StyledButton = styled.div`
  font-weight: bold;
  margin-top: 2rem;
  margin-bottom: 2rem;
  background: #5397f5;
  padding: 1rem 1.9rem;
  border-radius: 3px;
  font-size: 1.2rem;
  text-transform: uppercase;
  max-width: 268px;
  display: flex;
  grid-gap: .7rem;
  a {
    text-decoration: none;
    color: white;
  }
  &:hover {
    background-color: #2b2e3c;
  }
`;

const PrimaryButton: React.FC<{
  text: string;
  destination: string;
  onClickLink: React.MouseEventHandler;
}> = ({ text, destination, onClickLink }) => {
  return (
    <StyledButton>
      <Link onClick={onClickLink} to={destination}>
        {text}
      </Link>
      <img width={24} height={24} src="/icons/arrow-right.svg" alt="arrow" />
    </StyledButton>
  );
};

export default PrimaryButton;
