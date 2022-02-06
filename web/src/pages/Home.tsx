import styled from "styled-components";

import CTAButton from "../components/CTAButton";
import SupportSection from "../components/SupportSection";
import HeroSubtitle from "../components/hero/HeroSubtitle"
import HeroTitle from "../components/hero/HeroTitle"
import HeroText from "../components/hero/HeroText"

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



const HomePage = () => {
  const index = Math.round(Math.random() * 4);
  const image = `mascot/Notion ${index + 1}.png`;

  return (
    <>
      <Container>
        <h1>
          <HeroTitle>Everything you need to</HeroTitle>
          <HeroSubtitle> learn fast</HeroSubtitle>
        </h1>
        <HeroText>
          We are making it the easiest and fastest way to create beautiful Anki
          flashcards for anyone anywhere around the world 🌎
        </HeroText>
          <div className="is-flex is-justify-content-center	">
            <CTAButton
              destination="/upload"
              text="Get Started"
              onClickLink={() => {}}
            />
          </div>
        <CtaGroup>
          <p>
            Fast, simple, easy and 100%{" "}
            <a href="https://github.com/alemayhu/notion2anki">Free</a>!
          </p>
        </CtaGroup>
        <MascotImage src={image} alt="Notion to Anki Mascot" loading="lazy" />
        <h2>Tutorials on YouTube</h2>
        <p>
          You can find videos showing you how to get started on our <a href="https://www.youtube.com/playlist?list=PLzOAzzqpDqukOtwH3IYWiOhr_sjBjfgCd">Notion to Anki</a> playlist.
          If you have any questions, do not hesistate to ask questions (see{" "}
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
