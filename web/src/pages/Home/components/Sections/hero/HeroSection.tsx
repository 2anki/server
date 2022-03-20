import { useState } from 'react';
import styled from 'styled-components';
import HeroSubtitle from './HeroSubtitle';
import HeroText from './HeroText';
import HeroTitle from './HeroTitle';
import PrimaryButton from '../../../../../components/buttons/PrimaryButton';
import PersonIllustration from '../../../../../components/illustrations/PersonIllustration';

const StyledSection = styled.section`
  background: #e5e5e5;
`;
const StyledIframe = styled.iframe`
  margin: 0 auto;
  display: none;
`;

const VideoWrapper = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
`;

const PlayIcon = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  :hover {
    cursor: pointer;
  }
  object-fit: cover;
`;

const VideoPoster = styled.img`
  width: 100%;
  object-fit: cover;
`;

const Illustration3 = styled(PersonIllustration)`
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

const Illustration2 = styled(PersonIllustration)`
  bottom: -80px;
  right: -87px;

  @media (max-width: 1024px) {
    width: 82.6px;
    height: 89.62px;

    bottom: 0;
    right: 0;
  }
`;

const Illustration1 = styled(PersonIllustration)`
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
function HeroSection() {
  const [play, setPlay] = useState(false);

  return (
    <StyledSection className="hero is-halfheight">
      <div className="container">
        <h1>
          <HeroTitle>Everything you need to</HeroTitle>
          <HeroSubtitle> learn fast</HeroSubtitle>
        </h1>
        <HeroText>
          We are making it the easiest and fastest way to create beautiful Anki
          flashcards for anyone anywhere around the world!
        </HeroText>
        <div className="is-flex is-justify-content-center">
          <PrimaryButton
            destination="/upload"
            text="Get Started"
            onClickLink={() => {}}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <div>
            <Illustration1
              src="/illustrations/illustrations-1.svg"
              alt="illustration of man"
            />
            <Illustration2
              src="/illustrations/illustrations-2.svg"
              alt="illustration of second man"
            />
            <Illustration3
              src="/illustrations/illustrations-3.svg"
              alt="illustration of third man"
            />
          </div>
          <VideoWrapper>
            {!play && (
              <>
                <VideoPoster
                  src="/video-poster.png"
                  alt="video"
                  onClick={() => setPlay(true)}
                />
                <PlayIcon
                  className="is-hidden-mobile"
                  src="/icons/play-icon.svg"
                  width={50}
                  height={50}
                  alt="play"
                  onClick={() => setPlay(true)}
                />
              </>
            )}
            {play && (
              <StyledIframe
                className="is-flex"
                width="800"
                height="418"
                src="https://www.youtube.com/embed/Ex3DuBvCo0Y?autoplay=1"
                title="Preview of 2anki.net - Beta Notion API Integration"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </VideoWrapper>
        </div>
      </div>
    </StyledSection>
  );
}

export default HeroSection;
