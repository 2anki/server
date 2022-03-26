import { useState } from 'react';
import HeroText from './HeroText';
import PrimaryButton from '../../../../../components/buttons/PrimaryButton';
import {
  Illustration1,
  Illustration2,
  Illustration3,
  PlayIcon,
  StyledIframe,
  StyledSection,
  VideoPoster,
  VideoWrapper,
  HeroSubtitle,
  HeroTitle,
  HeroTitleContainer,
  HeroSubtitleAlignRight,
} from './styled';

function HeroSection() {
  const [play, setPlay] = useState(false);

  return (
    <StyledSection className="hero is-halfheight">
      <div className="container">
        <HeroTitleContainer>
          <HeroTitle>Create </HeroTitle>
          <HeroSubtitle>Anki flashcards</HeroSubtitle>
          <HeroSubtitleAlignRight>fast</HeroSubtitleAlignRight>
        </HeroTitleContainer>
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
