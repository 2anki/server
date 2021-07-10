import styled from "styled-components";

import VideoSection from "../components/VideoSection";
import CTAButton from "../components/CTAButton";

const MascotImage = styled.img`
  height: 500px;
  object-fit: contain;
`;

const Container = styled.div`
  max-width: 720px;
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
  a {
    color: white;
    font-weight: bold;
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
        <p>
          <strong>Convert Notion to Anki Flashcards ✨</strong>
          We are making it the easiest and fastest way to create beautiful Anki
          flashcards for anyone anywhere around the world 🌎
        </p>
        <CtaGroup>
          <CTAButton
            isLarge
            destination="/upload"
            text="Get Started"
            onClickLink={() => {}}
          />
          <p>
            Fast, simple, easy and 100%{" "}
            <a href="https://github.com/alemayhu/notion2anki">Free</a>!
          </p>
        </CtaGroup>
        <MascotImage src={image} alt="Notion to Anki Mascot" loading="lazy" />
        <hr />
        <h2>Tutorials on YouTube</h2>
        <p>
          Below are some selected videos to get you started with the project and
          see some common use cases. If you have any questions, do not hesistate
          to ask questions (see{" "}
          <a href="https://www.notion.so/Contact-e76523187cc64961972b3ad4f7cb4c47">
            contact
          </a>{" "}
          page).
          <CtaGroup>
            Make sure to like the videos and
            <Subscribe />
          </CtaGroup>
        </p>
        <VideoSection
          title="How to Create Anki Flashcards from Notion Toggle Lists with Notion to Anki"
          description={`This is the first tutorial where Notion to Anki was unveiled to the world. It's bit a bit outdated but you can see where it all started.  Enjoy!`}
          url="https://www.youtube.com/embed/b3eQ0exhdz4"
        />
        <VideoSection
          title="Read Faster, Remember More | Incremental Reading with Anki, Notion and notion2anki"
          description="In this video we look at how you can use Anki, Notion and notion2anki to implement a incremental reading system that is totally free. "
          url="https://www.youtube.com/embed/4PdhlNbBqXo"
        />
        <VideoSection
          title="How to Turn Any Website in to Anki Flashcards With Notion to Anki"
          description="Make Anki flashcards faster with Notion to Anki: https://2anki.net/"
          url="https://www.youtube.com/embed/NLUfAWA2LJI"
        />
        <VideoSection
          title="Maximum One Toggle per Card | Notion to Anki Tutorial - Card Option"
          description="In this video we take a look at the most recently added card option in Notion to Anki: Maximum One Toggle per Card."
          url="https://www.youtube.com/embed/DiYc5UErYOY"
        />
        <VideoSection
          title="Notion + Anki"
          description="Hei there 👋🏾 in this video we talk about what really is the goal with notion2anki and why we are all about cooperation 🤝"
          url="https://www.youtube.com/embed/FjifJG4FoXY"
        />
      </Container>
    </>
  );
};

export default HomePage;
