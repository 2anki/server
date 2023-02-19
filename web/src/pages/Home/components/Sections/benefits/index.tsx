import GreySection from '../../../../../components/GreySection';
import Heading2 from '../../../../../components/text/Heading2';
import { Illustration } from './styled';
import benefits from './benefits';
import BenefitsList from './BenefitsList';

function BenefitsSection() {
  return (
    <GreySection className="section">
      {' '}
      <div className="container">
        <Heading2 id="benefits" isDashed>
          Benefits
        </Heading2>
        <div className="columns">
          <BenefitsList benefits={benefits} />
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
