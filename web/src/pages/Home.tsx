import styled from "styled-components";

import CTAButton from "../components/CTAButton";

const MascotImage = styled.img`
  height: 500px;
  object-fit: contain;
`;

const Container = styled.div`
  max-width: 720px;
  margin: 0 auto;
`;

const CtaGroup = styled.div`
  display: flex;
  align-items: center;
  grid-gap: 1rem;
`;
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
      </Container>
    </>
  );
};

export default HomePage;
