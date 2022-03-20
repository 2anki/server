import styled from 'styled-components';

const StyledParagraph = styled.p`
  max-width: 590px;
  margin: 0 auto;
  text-align: center;
  font-size: 20px;
  @media (max-width: 1024px) {
    font-size: 16px;
    text-align: left;
    margin: unset;
  }
`;

interface HeroTextProps {
  children: React.ReactNode;
}

function HeroText({ children }: HeroTextProps) {
  return <StyledParagraph>{children}</StyledParagraph>;
}

export default HeroText;
