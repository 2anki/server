import { VideoBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { isFullBlock } from '@notionhq/client';
import getYouTubeID from '../../../../../lib/parser/helpers/getYouTubeID';
import getYouTubeEmbedLink from '../../../../../lib/parser/helpers/getYouTubeEmbedLink';
import { isVimeoLink } from './isVimeoLink';
import { renderToStaticMarkup } from 'react-dom/server';

export const getVimeoVideoId = (vimeoUrl: string) => {
  const parts = vimeoUrl.split('/').pop();
  if (!parts) {
    return null;
  }
  return parts.split('?')[0];
};

export const getVideoUrl = (block: VideoBlockObjectResponse): string | null => {
  if (!isFullBlock(block)) {
    return null;
  }
  switch (block.video.type) {
    case 'external':
      const url = block.video.external.url;
      const yt = getYouTubeID(url);
      if (yt) {
        return getYouTubeEmbedLink(yt);
      } else if (isVimeoLink(url)) {
        const vimeoUrl = url.replace('vimeo.com/', 'player.vimeo.com/video/');
        if (vimeoUrl) {
          const videoId = getVimeoVideoId(vimeoUrl);
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
      return block.video.external.url;
    case 'file':
      return block.video.file.url;
    default:
      return 'unsupported video: ' + JSON.stringify(block);
  }
};
