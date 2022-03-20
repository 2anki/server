import styled from 'styled-components';

import { Link } from 'react-router-dom';

const StyledButton = styled.div<{ minHeight? }>`
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
    /* width: 221px; */
    height: ${(props) => (props.minHeight ? props.minHeight : '54px')};
    margin-right: auto;
  }
`;

interface PrimaryButtonProps {
  text: string;
  destination: string;
  onClickLink: React.MouseEventHandler;
  minHeight?: string;
}

export default function PrimaryButton({
  text, destination, onClickLink, minHeight,
}: PrimaryButtonProps) {
  return (
    <StyledButton minHeight={minHeight}>
      {destination.includes('http') ? (
        <a href={destination} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ) : (
        <Link onClick={onClickLink} to={destination}>
          {text}
        </Link>
      )}
      <img width={24} height={24} src="/icons/arrow-right.svg" alt="arrow" />
    </StyledButton>
  );
}

PrimaryButton.defaultProps = {
  minHeight: '',
};
