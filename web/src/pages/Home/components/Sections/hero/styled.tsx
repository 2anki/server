import styled from 'styled-components';
import PersonIllustration from '../../../../../components/illustrations/PersonIllustration';

export const StyledSection = styled.section`
  background: #e5e5e5;
`;
export const StyledIframe = styled.iframe`
  margin: 0 auto;
  display: none;
`;

export const VideoWrapper = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
`;

export const PlayIcon = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  :hover {
    cursor: pointer;
  }
  object-fit: cover;
`;

export const VideoPoster = styled.img`
  width: 100%;
  object-fit: cover;
`;

export const Illustration3 = styled(PersonIllustration)`
  position: absolute;
  width: 199.61px;
  height: 261.34px;
  bottom: 0;
  left: -100px;

  @media (max-width: 1024px) {
    width: 61.08px;
    height: 79.97px;
    left: 0;
  }
`;

export const Illustration2 = styled(PersonIllustration)`
  bottom: -80px;
  right: -87px;

  @media (max-width: 1024px) {
    width: 82.6px;
    height: 89.62px;

    bottom: 0;
    right: 0;
  }
`;

export const Illustration1 = styled(PersonIllustration)`
  top: -148px;
  left: -100px;
  width: 213px;
  height: 200.69px;
  @media (max-width: 1024px) {
    width: 83px;
    height: 78.32px;
    top: 0;
    left: 0;
  }
`;

export const HeroTitle = styled.span`
  font-size: 90px;
  font-weight: bold;
  color: #2b2e3c;
  @media (max-width: 1024px) {
    font-size: 40px;
    text-align: left;
  }
`;

export const HeroTitleContainer = styled.h1`
  display: flex;
  flex-direction: column;
`;

export const HeroSubtitle = styled(HeroTitle)`
  display: block;
  text-align: center;
  background: linear-gradient(#6b5eff, 70%, #5397f5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  @media (max-width: 1024px) {
    text-align: left;
  }
`;

export const HeroSubtitleAlignRight = styled(HeroTitle)`
  align-self: flex-end;
  color: #5397f5;
  @media (max-width: 1024px) {
    align-self: flex-start;
  }
`;

export const StyledParagraph = styled.p`
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
