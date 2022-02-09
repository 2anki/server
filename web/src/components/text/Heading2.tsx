import styled from "styled-components";
import HeadingDash from "./HeadingDash";

const StyledHeading2 = styled.h2`
  font-family: Rubik;
  font-style: normal;
  font-weight: 600;
  font-size: 50px;
  line-height: 50px;

  color: #2b2e3c;

  @media (max-width: 1024px) {
    font-size: 30px;
  }
`;

const Heading2 = ({ id, name, isDashed, children }) => {
  return (
    <StyledHeading2 id={id}>
      {children}
      {isDashed && <HeadingDash />}
    </StyledHeading2>
  );
};

export default Heading2;
