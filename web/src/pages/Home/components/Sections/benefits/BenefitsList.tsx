import BlueHeading3 from '../../../../../components/text/BlueHeading3';
import { BenefitIcon } from './styled';
import { Benefit } from './benefits';

interface BenefitsListProps {
  benefits: Benefit[];
}

export default function BenefitsList({ benefits }: BenefitsListProps) {
  return (
    <div className="column">
      <div className="columns is-flex-direction-column">
        {benefits.map((benefit) => (
          <div key={benefit.title} className="column is-flex">
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
