import { GetBlockResponse } from '@notionhq/client/build/src/api-endpoints';

import BlockHandler from '../BlockHandler';
import { BlockHeading } from '../blocks/BlockHeadings';
import FrontFlashcard from '../blocks/FrontFlashcard';
import BlockColumn from '../blocks/lists/BlockColumn';
import getColumn from './getColumn';
import isColumnList from './isColumnList';
import isHeading from './isHeading';
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
  if (handler.settings.learnMode && type === 'image') {
    /* @ts-ignore */
    const { url } = block.image.file;
    return `<img src='${url}' />`;
  }

  if (isToggle(block)) {
    // @ts-ignore
    const { toggle } = block;
    if (toggle && toggle.text?.length > 0) {
      return renderTextChildren(toggle.text, handler.settings);
    }
  }
  // @ts-ignore
  return FrontFlashcard(block[type], handler);
}
