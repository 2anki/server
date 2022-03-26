import PrimaryButton from '../../../../../components/buttons/PrimaryButton';
import BlueHeading3 from '../../../../../components/text/BlueHeading3';
import Heading2 from '../../../../../components/text/Heading2';
import { Mascot, Text } from './styled';

function AboutSection() {
  return (
    <section className="section has-background-white">
      <div className="container">
        <div className="columns">
          <div id="about" aria-label="about section" />
          <Mascot className="column">
            <img src="/mascot/Notion 4.png" alt="Notion" />
          </Mascot>
          <Text className="column">
            <Heading2 id="aa" isDashed>
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
}

export default AboutSection;
