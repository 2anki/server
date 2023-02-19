import GreySection from '../../../../../components/GreySection';
import Heading2 from '../../../../../components/text/Heading2';
import { Curve, Illustration4, Testimonials } from './styled';
import Testimonial from './Testimonial';

import TESTIMONIALS from './testimonials';

function TestimonialsSection() {
  const users = TESTIMONIALS;
  return (
    <>
      <Curve />
      <GreySection className="section">
        <div className="container">
          <Heading2 id="testimony" isDashed>
            Love for 2anki
          </Heading2>
          <Illustration4
            src="/illustrations/illustrations-4.svg"
            alt="illustration of third man"
          />
          <Testimonials className="columns">
            {users.map((user) => (
              <Testimonial
                key={user.name}
                name={user.name}
                description={user.description}
                title={user.title}
                profile={user.profile}
              />
            ))}
          </Testimonials>
        </div>
      </GreySection>
    </>
  );
}

export default TestimonialsSection;
