import { StyledParagraph } from './styled';

interface HeroTextProps {
  children: React.ReactNode;
}

function HeroText({ children }: HeroTextProps) {
  return <StyledParagraph>{children}</StyledParagraph>;
}

export default HeroText;
