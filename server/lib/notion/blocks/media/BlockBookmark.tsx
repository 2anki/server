import ReactDOMServer from "react-dom/server";
import cheerio from "cheerio";
import axios from "axios";

import { GetBlockResponse } from "@notionhq/client/build/src/api-endpoints";

const metascraper = require("metascraper")([
  require("metascraper-description")(),
  require("metascraper-image")(),
  require("metascraper-logo-favicon")(),
  require("metascraper-title")(),
  require("metascraper-url")(),
]);

const BlockBookmark = async (
  block: GetBlockResponse
): Promise<string | null> => {
  /* @ts-ignore */
  const bookmark = block.bookmark;
  const response = await axios.get(bookmark.url);
  const html = response.data;
  const metadata = await metascraper({ html, url: bookmark.url });
  let description = metadata.description;
  if (!description) {
    const dom = cheerio.load(html);
    const maxAttempt = 5;
    let i = 0;
    while (i < maxAttempt && !description) {
      const paragraph = dom("p").next();
      if (paragraph) {
        const text = paragraph.text();
        if (text && text.trim()) {
          description = text.slice(0, 158);
        }
        break;
      }
      i++;
    }
  }

  return ReactDOMServer.renderToStaticMarkup(
    <a href={bookmark.url} className="bookmark source">
      <div className="bookmark-info">
        <div className="bookmark-text">
          <div className="bookmark-title">{metadata.title}</div>
          <div className="bookmark-description">{description}</div>
        </div>
        <div className="bookmark-href">
          <img src={metadata.logo} className="icon bookmark-icon" />
          {bookmark.url}
        </div>
      </div>
      <img src={metadata.image} className="bookmark-image" />
    </a>
  );
};

export default BlockBookmark;
