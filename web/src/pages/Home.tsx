import styled from "styled-components";

import SupportSection from "../components/SupportSection";
import HeroSection from "../components/hero/HeroSection";
import AboutSection from "../components/about/AboutSection";

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

const HomePage = () => {
  const index = Math.round(Math.random() * 4);
  const image = `mascot/Notion ${index + 1}.png`;

  return (
    <>
      <HeroSection />
      <AboutSection />
    </>
  );
};

export default HomePage;
