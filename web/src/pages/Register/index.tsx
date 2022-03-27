import styled from 'styled-components';
import {
  Card, Container, PricingPlans, SelectButton, StyledPage,
} from './styled';

interface ITier {
  title: string;
  description: string;
  price: number;
  cta: string;
}

function Tier({
  title, description, price, cta,
}: ITier) {
  return (
    <Card>
      <h3 className="subtitle is-4">{title}</h3>
      <p>{description}</p>
      <p className="title is-5">
        <span className="title is-3">{price}</span>
        {' '}
        $
        {' '}
        {price > 10 ? 'once' : 'month'}
      </p>
      <div>
        <SelectButton>
          <a href={cta}>Select</a>
        </SelectButton>
      </div>
    </Card>
  );
}

const ImageWrapper = styled.div`
  margin: 1rem;
  img {
    border-radius: 0.7rem;
  }
`;

function PreSignupPage() {
  return (
    <Container>
      <StyledPage>
        <Container>
          <h2 className="has-text-white subtitle is-4">new!</h2>
          <h1 className="title has-text-white is-1 mx-2">
            Automatically Synchronize Your Notion Notes Into Anki
          </h1>
          <p className="mx-6 has-text-left">
            Creating flashcards has never been easier than this. You can now
            collaborate with your friends using Notion and create flashcards
            insanely fast!
          </p>
          <ImageWrapper>
            <img alt="Notion to Anki" src="pre-signup.png" />
          </ImageWrapper>
          <p className="mx-6 has-text-left">
            2anki.net is open source and will remain free but to dedicate more
            time and effort to providing a great service. We need to invest a lot
            of time in the project. Continuing down a free path for the hosted
            version is not sustainable, hence we are offering you the option to
            show your interest for a PRO version with less restrictions and more
            power to you.
          </p>
          <h3 className="subtitle is-3 has-text-white">
            Get a 10% discount if you pre-signup.
            {' '}
            <br />
            No creditcard required.
          </h3>
          <p className="is-4 subtitle has-text-white">Select your plan</p>
          <PricingPlans>
            <Tier
              title="Monthly"
              description="Perfect for students on a budget"
              price={10}
              cta="https://www.subscribepage.com/notion2ankimonthly"
            />
            <Tier
              title="Life time supporter"
              description="For die-hard supporters and life-long learners"
              price={90}
              cta="https://www.subscribepage.com/notion2ankilifetime"
            />
          </PricingPlans>
        </Container>
      </StyledPage>
    </Container>
  );
}

export default PreSignupPage;
