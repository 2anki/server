import styled from 'styled-components';

import { Link } from 'react-router-dom';

const StyledButton = styled.div`
  font-weight: bold;
  margin-top: 2rem;
  margin-bottom: 2rem;
  background: rgb(207, 83, 89);
  padding: 1rem 1.9rem;
  border-radius: 3px;
  font-size: 1.2rem;
  a {
    text-decoration: none;
    color: white;
  }
  &:hover {
    background-color: rgb(207, 83, 0);
  }
`;

interface Props {
  text: string;
  destination: string;
  onClickLink: React.MouseEventHandler;
}

function CTAButton({ text, destination, onClickLink }: Props) {
  return (
    <StyledButton>
      <Link onClick={onClickLink} to={destination}>
        {text}
      </Link>
    </StyledButton>
  );
}

export default CTAButton;
