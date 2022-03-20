import styled from "styled-components";
import PrimaryButton from "../buttons/PrimaryButton";

import PersonIllustration from "../illustrations/PersonIllustration";
import ArrowRight from "../icons/ArrowRight";
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
      <a className="is-uppercase has-text-weight-bold" href={href}>
        Read more
      </a>
      <ArrowRight innerFill="#5397f5" />
    </div>
  );
};

const FeaturedEntry = () => {
  return (
    <div className="card">
      {/* <div className="card-image">
        <figure className="image is-4by3">
          <img
            src="https://bulma.io/images/placeholders/1280x960.png"
            alt="Placeholder image"
          />
        </figure>
      </div> */}
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

const NewsEntry = ({ title, description, link }) => {
  return (
    <div className="card">
      <div className="card-content">
        <h3 className="title is-4">{title}</h3>
        <p className="content">{description}</p>
        <ReadMore href={link} />
      </div>
    </div>
  );
};

const ReadMoreNews = styled(PrimaryButton)``;

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
        <div className="column">
          <NewsEntry
            title={"What's Next? The Path to v1.0.0!"}
            description={
              "There are a three main things I would like to tackle longterm but in this session"
            }
            link={"https://www.patreon.com/posts/whats-next-path-51204766"}
          />
          <div className="my-2"></div>
          <NewsEntry
            title={"Good News!"}
            description={
              "I woke up in the middle of the night and had to go to the toilet 🚾"
            }
            link={"https://www.patreon.com/posts/good-news-51122343"}
          />
        </div>
      </div>
      <Centered>
        <ReadMoreNews
          destination="https://www.patreon.com/alemayhu"
          text="READ MORE NEWS"
          onClickLink={() => {}}
        />
      </Centered>
    </section>
  );
};

export default NewsSection;
