import { ReactNode } from 'react';
import styled from 'styled-components';

const StyledBox = styled.div`
  border: 2px solid #3ccffc;
  margin: 1rem;
`;

interface Props {
  children: ReactNode;
}

function BlueTintedBox({ children }: Props) {
  return <StyledBox className="box">{children}</StyledBox>;
}

export default BlueTintedBox;
