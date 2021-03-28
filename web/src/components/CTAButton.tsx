import styled from "styled-components";

import {Link} from "react-router-dom"

const StyledButton = styled.div`
  font-weight: bold;
  margin-top: 2rem;
  margin-bottom: 2rem;
  background: rgb(207, 83, 89);
  a {
    color: white;
  }
  &:hover {
    background-color: rgb(207, 83, 0);
  }
`;

const CTAButton: React.FC<{isLarge: boolean, text: string, destination: string}> = ({isLarge, text, destination}) => {
  return (
    <StyledButton className={`button ${isLarge ? 'is-large' : null}`}>
      <Link to={destination}>{text}</Link>
    </StyledButton>
  );
};

export default CTAButton;
