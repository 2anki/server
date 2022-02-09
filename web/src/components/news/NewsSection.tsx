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

const ReadMore = ({ href }) => {
  return (
    <div className="is-flex">
      <a href={href}>Read more</a>
      <img
        width={24}
        height={24}
        style={{ background: "red" }}
        src="/icons/arrow-right.svg"
        alt="arrow"
      />
    </div>
  );
};

const FeaturedEntry = () => {
  return (
    <div className="card">
      <div className="card-image">
        <figure className="image is-4by3">
          <img
            src="https://bulma.io/images/placeholders/1280x960.png"
            alt="Placeholder image"
          />
        </figure>
      </div>
      <div style={{ background: "#F8F8F8" }} className="card-content">
        <div className="media">
          <div className="media-content">
            <p className="title is-4">The state of 2anki.net 💫</p>
          </div>
        </div>
        <div className="content">
          I hope you are doing well in this special time. Before the year ends I
          wanted to give you a special update.
          <br />
        </div>
        <ReadMore
          href={
            "https://www.patreon.com/posts/state-of-2anki-60331662?utm_medium=clipboard_copy&utm_source=copy_to_clipboard&utm_campaign=postshareI"
          }
        />
      </div>
    </div>
  );
};

const NewsSection = () => {
  return (
    <section className="section">
      <div className="is-relative">
        <NewsIcon src={"/icons/news-icon.svg"} />
      </div>
      <Heading2 id={"news"} isDashed={true}>
        News
      </Heading2>
      <div className="columns">
        <div className="column">
          <FeaturedEntry />
        </div>
        <div className="column"></div>
      </div>
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
