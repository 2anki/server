import styled from 'styled-components';

import BlueHeading3 from '../text/BlueHeading3';
import GreySection from '../GreySection';
import Heading2 from '../text/Heading2';

const Illustration = styled.img`
  width: 632.24px;
  height: 549px;

  @media (max-width: 1024px) {
    width: 100vw;
  }
`;

const BenefitIcon = styled.img`
  width: 78px;
  height: 78px;
`;

const benefits = [
  {
    icon: '/icons/benefit-icon-1.svg',
    title: 'All of the Anki note types are supported.',
    description:
      'Support a lot of media like basic cards, reversed cards, cloze deletion, and input card',
  },
  {
    title: 'Rich media support',
    icon: '/icons/benefit-icon-2.svg',
    description: 'Support a lot of media like images, emojis, embeds and Math.',
  },
  {
    icon: '/icons/benefit-icon-3.svg',
    title: 'Mobile friendly',
    description:
      'The website works fine with your browser on iOS and Android. To see how people use it watch',
  },
];

function BenefitsList() {
  return (
    <div className="column">
      <div className="columns is-flex-direction-column">
        {benefits.map((benefit) => (
          <div className="column is-flex">
            <div className="pr-4">
              <BenefitIcon src={benefit.icon} />
            </div>
            <div>
              <BlueHeading3>{benefit.title}</BlueHeading3>
              <p>{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BenefitsSection() {
  return (
    <GreySection className="section">
      {' '}
      <div className="container">
        <Heading2 id="benefits" isDashed>
          Benefits
        </Heading2>
        <div className="columns">
          <BenefitsList />
          <div className="column">
            <Illustration
              src="/illustrations/illustrations-5.svg"
              alt="Notion"
            />
          </div>
        </div>
      </div>
    </GreySection>
  );
}

export default BenefitsSection;
