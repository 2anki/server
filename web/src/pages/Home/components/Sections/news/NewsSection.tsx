import Heading2 from '../../../../../components/text/Heading2';
import NewsEntry from '.';
import { Centered, NewsIcon, ReadMoreNews } from './styled';
import ReadMore from './ReadMore';

function FeaturedEntry() {
  return (
    <div className="card">
      <div style={{ background: '#F8F8F8' }} className="card-content">
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
        <ReadMore href="https://www.patreon.com/posts/state-of-2anki-60331662?utm_medium=clipboard_copy&utm_source=copy_to_clipboard&utm_campaign=postshareI" />
      </div>
    </div>
  );
}

function NewsSection() {
  return (
    <section className="section">
      <div className="is-relative">
        <NewsIcon src="/icons/news-icon.svg" />
      </div>
      <Heading2 id="news" isDashed>
        News
      </Heading2>
      <div className="columns">
        <div className="column">
          <FeaturedEntry />
        </div>
        <div className="column">
          <NewsEntry
            title={"What's Next? The Path to v1.0.0!"}
            description="There are a three main things I would like to tackle longterm but in this session"
            link="https://www.patreon.com/posts/whats-next-path-51204766"
          />
          <div className="my-2" />
          <NewsEntry
            title="Good News!"
            description="I woke up in the middle of the night and had to go to the toilet 🚾"
            link="https://www.patreon.com/posts/good-news-51122343"
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
}

export default NewsSection;
