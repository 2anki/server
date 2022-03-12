import { ReactNode } from 'react';
import styled from 'styled-components';

const StyledBox = styled.div`
  border: 2px solid #3ccffc;
  margin: 1rem;
`;

const BlueTintedBox: React.FC<{
  children: ReactNode;
}> = ({ children }) => <StyledBox className="box">{children}</StyledBox>;

export default BlueTintedBox;
