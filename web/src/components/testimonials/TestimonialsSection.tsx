import styled from "styled-components";

import PersonIllustration from "../illustrations/PersonIllustration";
import GreySection from "../GreySection";
import Heading2 from "../text/Heading2";

const Testimonials = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

let users = [
  {
    name: "Gabriel Tabbal",
    description:
      "Game-changing tool. Anki2Notion will take your studying to the next level. It will undeniably save you an enormous amount of time. Gone are the days of manually creating flashcards.",
    title: "undergraduate student",
    profile: null,
  },
  {
    name: "King Waffle",
    title: "YouTube comment",
    description: "god tier addon",
    profile:
      "https://yt3.ggpht.com/ytc/AKedOLQuCkq63lQqeLomKdKJe8ku2WOfb5ON1Dj6ELZs=s48-c-k-c0x00ffffff-no-rj",
  },
];

const Testimonial = ({ name, description, title, profile }) => {
  return (
    <div className="is-flex column m-4 is-flex-direction-column box has-background-white has-text-grey-dark">
      <div className="is-flex">
        {profile && (
          <div className="is-flex is-align-items-center is-justify-content-start mt-4">
            <div className="image is-48x48">
              <img alt="profil" src={profile} className="is-rounded" />
            </div>
          </div>
        )}
        <div className="is-flex is-flex-direction-column is-justify-content-center ml-2 is-align-content-space-between">
          <span className="font-semibold has-text-weight-bold">{name}</span>
          <span className="is-size-7 is-flex is-align-items-center">
            {title}
          </span>
        </div>
      </div>
      <p>
        <span className="font-bold has-text-primary is-size-5">“</span>
        {description}
        <span className="font-bold has-text-primary is-size-5">”</span>
      </p>
    </div>
  );
};

const Illustration4 = styled(PersonIllustration)`
  position: absolute;
  top: -380px;
  right: 0;
  width: 152px;
  height: 341px;

  @media (max-width: 1024px) {
    margin-top: 4rem;
    width: 146px;
    height: 328px;
    /* top: -320px; */
  }
`;

const Curve = styled.div`
  background-color: #ebeced;
  width: 100vw;
  height: 150px;
  border-top-left-radius: 50%;
  border-top-right-radius: 50%;
`;

const TestimonialsSection = () => {
  return (
    <>
      <Curve />
      <GreySection className="section">
        <div className="container">
          <Heading2 id="testimony" isDashed={true}>
            Love for 2anki
          </Heading2>
          <Illustration4
            src="/illustrations/illustrations-4.svg"
            alt="illustration of third man"
          />
          <Testimonials className="columns">
            {users.map((user) => (
              <Testimonial key={user.name} {...user} />
            ))}
          </Testimonials>
        </div>
      </GreySection>
    </>
  );
};

export default TestimonialsSection;
