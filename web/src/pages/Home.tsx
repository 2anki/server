import styled from "styled-components";

import PrimaryButton from "../components/buttons/PrimaryButton";
import SupportSection from "../components/SupportSection";
import HeroSubtitle from "../components/hero/HeroSubtitle";
import HeroTitle from "../components/hero/HeroTitle";
import HeroText from "../components/hero/HeroText";
import HeroSection from "../components/hero/HeroSection";
import { useState } from "react";

const MascotImage = styled.img`
  height: 500px;
  object-fit: contain;
`;

const Container = styled.div`
  max-width: 1010px;
  margin: 0 auto;

  h2 {
    font-size: 1.5em;
    font-weight: bolder;
  }
  h3 {
    padding-top: 2rem;
    font-size: 1.17em;
    font-weight: bolder;
  }

  @media (max-width: 1024px) {
    margin-left: 3rem;
    margin-right: 3rem;
  }
`;

const CtaGroup = styled.div`
  display: flex;
  align-items: center;
  grid-gap: 1rem;
  flex-direction: column;
  grid-gap: 1rem;
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const StyledSubscribe = styled.div`
  background: rgb(220, 38, 38);
  border-radius: 0.25rem;
  padding: 0.5rem;
  width: 100px;
  text-align: center;
  a {
    color: white;
    font-weight: bold;
    text-decoration: none;
  }
  &:hover {
    background-color: rgb(207, 83, 0);
  }
`;

const Subscribe = () => {
  const link = "https://youtube.com/c/alexanderalemayhu?sub_confirmation=1";
  return (
    <StyledSubscribe>
      <a rel="noreferrer" target="_blank" href={link}>
        Subscribe
      </a>
    </StyledSubscribe>
  );
};

const StyledIframe = styled.iframe`
  margin: 0 auto;
  display: none;
`;

const VideoWrapper = styled.div`
  width: 800px;
  margin: 0 auto;
  position: relative;
`;

const PlayIcon = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  :hover {
    cursor: pointer;
  }
`;

const HomePage = () => {
  const index = Math.round(Math.random() * 4);
  const image = `mascot/Notion ${index + 1}.png`;
  const [play, setPlay] = useState(false);

  return (
    <>
      <HeroSection className="hero is-fullheight">
        <div className="container">
          <h1>
            <HeroTitle>Everything you need to</HeroTitle>
            <HeroSubtitle> learn fast</HeroSubtitle>
          </h1>
          <HeroText>
            We are making it the easiest and fastest way to create beautiful
            Anki flashcards for anyone anywhere around the world!
          </HeroText>
          <div className="is-flex is-justify-content-center	">
            <PrimaryButton
              destination="/upload"
              text="Get Started"
              onClickLink={() => {}}
            />
          </div>
          <VideoWrapper>
            {!play && (
              <>
                <img
                  src="/video-poster.png"
                  width={800}
                  height={418}
                  alt={"video"}
                />
                <PlayIcon
                  src="/icons/play-icon.svg"
                  width={50}
                  height={50}
                  alt={"play"}
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
              ></StyledIframe>
            )}
          </VideoWrapper>
        </div>
      </HeroSection>
      <Container>
        <CtaGroup>
          <p>
            Fast, simple, easy and 100%{" "}
            <a href="https://github.com/alemayhu/notion2anki">Free</a>!
          </p>
        </CtaGroup>
        <MascotImage src={image} alt="Notion to Anki Mascot" loading="lazy" />
        <h2>Tutorials on YouTube</h2>
        <p>
          You can find videos showing you how to get started on our{" "}
          <a href="https://www.youtube.com/playlist?list=PLzOAzzqpDqukOtwH3IYWiOhr_sjBjfgCd">
            Notion to Anki
          </a>{" "}
          playlist. If you have any questions, do not hesistate to ask questions
          (see{" "}
          <a href="https://alemayhu.notion.site/Contact-e76523187cc64961972b3ad4f7cb4c47">
            contact
          </a>{" "}
          page).
          <CtaGroup>
            Make sure to like the videos and
            <Subscribe />
          </CtaGroup>
        </p>
        <SupportSection />
      </Container>
    </>
  );
};

export default HomePage;
