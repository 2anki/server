import { GetBlockResponse } from "@notionhq/client/build/src/api-endpoints";
import { renderToStaticMarkup } from "react-dom/server";
import BlockHandler from "../../BlockHandler";

export const BlockVideo = (c: GetBlockResponse, handler: BlockHandler) => {
  if (handler.settings?.isTextOnlyBack) {
    return '';
  }
  /* @ts-ignore*/
  const video = c.video;
  let url = video.external.url;
  if (url) {
    if (url.match("youtube.com/watch")) {
      url = url.replace("watch?v=", "embed/");
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
