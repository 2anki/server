import styled from "styled-components";
import PrimaryButton from "../buttons/PrimaryButton";

import PersonIllustration from "../illustrations/PersonIllustration";
import Heading2 from "../text/Heading2";

const NewsIcon = styled(PersonIllustration)`
  position: absolute;
  right: 0;
  width: 150.03px;
  height: 138.7px;
  top: -120px;
  @media (max-width: 1024px) {
    /* margin-top: 4rem; */
    width: 97px;
    height: 90px;
  }
`;

const Centered = styled.div`
  display: flex;
  justify-content: center;
`;

const NewsSection = () => {
  return (
    <section className="section">
      <div className="is-relative">
        <NewsIcon src={"/icons/news-icon.svg"} />
      </div>
      <Heading2 id={"news"} isDashed={true}>
        News
      </Heading2>
      <Centered>
        <PrimaryButton
          destination="https://www.patreon.com/alemayhu"
          text="READ MORE NEWS"
          onClickLink={() => {}}
        />
      </Centered>
    </section>
  );
};

export default NewsSection;
