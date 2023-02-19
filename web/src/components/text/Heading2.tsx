import styled from 'styled-components';
import React from 'react';
import HeadingDash from './HeadingDash';

interface Props {
  id: string;
  isDashed: boolean;
  children: React.ReactNode;
}

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

function Heading2({ id, isDashed, children }: Props) {
  return (
    <StyledHeading2 id={id}>
      {children}
      {isDashed && <HeadingDash />}
    </StyledHeading2>
  );
}

export default Heading2;
