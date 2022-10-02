import { GetBlockResponse } from '@notionhq/client/build/src/api-endpoints';
import { captureException } from '@sentry/node';

import BlockHandler from '../BlockHandler';
import { BlockHeading } from '../blocks/BlockHeadings';
import FrontFlashcard from '../blocks/FrontFlashcard';
import BlockColumn from '../blocks/lists/BlockColumn';
import getColumn from './getColumn';
import { getImageUrl } from './getImageUrl';
import isColumnList from './isColumnList';
import isHeading from './isHeading';
import { isImage } from './isImage';
import isToggle from './isToggle';
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

  if (isColumnList(block)) {
    const firstColumn = await getColumn(block.id, handler, 0);
    if (firstColumn) {
      return BlockColumn(firstColumn, handler);
    }
  }

  // Do not add the images in default mode
  if (handler.settings.learnMode && isImage(block)) {
    return `<img src='${getImageUrl(block)}' />`;
  }

  if (isToggle(block)) {
    // @ts-ignore
    const { toggle } = block;
    if (toggle && toggle.text?.length > 0) {
      return renderTextChildren(toggle.text, handler.settings);
    }
  }
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
