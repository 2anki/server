import {
  GetBlockResponse,
  ImageBlockObjectResponse,
  ToggleBlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { captureException } from '@sentry/node';

import BlockHandler from '../BlockHandler';
import BlockCode from '../blocks/BlockCode';
import { BlockHeading } from '../blocks/BlockHeadings';
import FrontFlashcard from '../blocks/FrontFlashcard';
import BlockColumn from '../blocks/lists/BlockColumn';
import { BlockVideo } from '../blocks/media/BlockVideo';
import getColumn from './getColumn';
import { getImageUrl } from './getImageUrl';
import isHeading from './isHeading';
import renderTextChildren from './renderTextChildren';

export default async function renderFront(
  block: GetBlockResponse,
  handler: BlockHandler
) {
  /* @ts-ignore */
  const { type } = block;
  if (isHeading(block)) {
    return BlockHeading(type, block, handler);
  }
  switch (type) {
    case 'column_list':
      const firstColumn = await getColumn(block.id, handler, 0);
      if (firstColumn) {
        return BlockColumn(firstColumn, handler);
      }
      break;
    case 'image':
      // Do not add the images in default mode
      const image = getImageUrl(block as ImageBlockObjectResponse);
      if (handler.settings.learnMode && image) {
        return `<img src='${image}' />`;
      }
      break;
    case 'code':
      if (handler.settings.learnMode) {
        return BlockCode(block, handler);
      }
      break;
    case 'toggle':
      const toggle = (block as ToggleBlockObjectResponse).toggle;
      if (toggle && toggle.rich_text.length > 0) {
        return renderTextChildren(toggle.rich_text, handler.settings);
      }
      break;
    case 'video':
      return BlockVideo(block, handler);
    default:
      try {
        // @ts-ignore
        return FrontFlashcard(block[type], handler);
      } catch (error) {
        captureException(error);
        return `Unsupported block type in front: ${type}\n${JSON.stringify(
          block,
          null,
          4
        )}`;
      }
  }
  return '';
}
