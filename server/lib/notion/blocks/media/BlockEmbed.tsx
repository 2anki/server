import { GetBlockResponse } from "@notionhq/client/build/src/api-endpoints";
import { renderToStaticMarkup } from "react-dom/server";
import BlockHandler from "../../BlockHandler";

export const BlockEmbed = (c: GetBlockResponse, handler: BlockHandler) => {
  if (handler.settings?.isTextOnlyBack) {
    return '';
  }
  /* @ts-ignore*/
  const embed = c.embed;
  let url = embed.url;
  if (url) {
    if (url.match("soundcloud.com")) {
      url = `https://w.soundcloud.com/player/?url=${url}`;
    } else if (url.match("twitter.com")) {
      return renderToStaticMarkup(
        <div className="source">
          <a href={url}>{url}</a>
        </div>
      );
    }
  }
  return renderToStaticMarkup(
    <>
      <iframe
        width="560"
        height="315"
        src={url}
        frameBorder="0"
        allowFullScreen
      ></iframe>
    </>
  );
};
