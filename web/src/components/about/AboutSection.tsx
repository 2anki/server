import styled from "styled-components";
import PrimaryButton from "../buttons/PrimaryButton";

import BlueHeading3 from "../text/BlueHeading3";
import Heading2 from "../text/Heading2";

const Text = styled.div`
justify-content: center;
    display: flex;
    flex-direction: column;
}
`;

const Mascot = styled.div`
  margin: 0 auto;
  width: 485px;
  img {
    object-fit: contain;
  }
  @media (max-width: 1024px) {
    width: 186px;
  }
`;

const AboutSection = () => {
  return (
    <section className="section has-background-white">
      <div className="container">
        <div className="columns">
          <Mascot className="column">
            <img src="/mascot/Notion 4.png" alt="Notion" />
          </Mascot>
          <Text className="column">
            <Heading2 id="about" isDashed={true}>
              What is 2anki?
            </Heading2>
            <p>
              2anki.net is a open source micro saas which takes Notion notes and
              converts them to Anki flashcards. This project is used by students
              and professionals around the world to practice for their exams.
            </p>
            <BlueHeading3>Fast, simple, easy and 100% Free!</BlueHeading3>
            <div className="is-flex is-justify-content-start">
              <PrimaryButton
                destination="/upload"
                text="Get Started"
                onClickLink={() => {}}
              />
            </div>
          </Text>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
