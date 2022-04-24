import { GetBlockResponse } from "@notionhq/client/build/src/api-endpoints";
import { renderToStaticMarkup } from "react-dom/server";
import getYouTubeEmbedLink from "../../../parser/helpers/getYouTubeEmbedLink";
import getYouTubeID from "../../../parser/helpers/getYouTubeID";
import BlockHandler from "../../BlockHandler";

export const BlockVideo = (c: GetBlockResponse, handler: BlockHandler) => {
  if (handler.settings?.isTextOnlyBack) {
    return '';
  }
  /* @ts-ignore*/
  const video = c.video;
  let url = video.external.url;
  if (url) {
    const yt = getYouTubeID(url);
    if (yt) {
      url = getYouTubeEmbedLink(yt);
    } else if (url.match("vimeo.com")) {
      url = url.replace("vimeo.com/", "player.vimeo.com/video/");
      const videoId = url.split("/").pop().split("?")[0];
      return renderToStaticMarkup(
        <iframe
          title="vimeo-player"
          src={`https://player.vimeo.com/video/${videoId}`}
          width="640"
          height="368"
          frameBorder="0"
          allowFullScreen
        ></iframe>
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
