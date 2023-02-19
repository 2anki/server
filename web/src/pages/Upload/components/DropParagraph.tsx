import styled from 'styled-components';

const DropParagraph = styled.div<{ hover: boolean }>`
  border: 1.3px dashed;
  border-radius: 3px;
  border-color: ${(props) => (props.hover ? '#5997f5' : 'lightgray')};
  padding: 4rem;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  grid-gap: 1rem;
`;

export default DropParagraph;
