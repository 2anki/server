import { isFullBlock } from '@notionhq/client';
import { captureMessage } from '@sentry/node';
import BlockHandler from '../BlockHandler';
import {
  BlockObjectResponse,
  ListBlockChildrenResponse,
  PartialBlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { blockToStaticMarkup } from './blockToStaticMarkup';

export const renderBack = async (
  handler: BlockHandler,
  requestChildren: Array<PartialBlockObjectResponse | BlockObjectResponse>,
  response: ListBlockChildrenResponse,
  handleChildren: boolean | undefined
) => {
  let back = '';
  for (const c of requestChildren) {
    // If the block has been handled before, skip it.
    // This can be true due to nesting
    if (handler.skip.includes(c.id)) {
      continue;
    }

    if (!isFullBlock(c)) {
      captureMessage('Block is not full', {
        extra: c,
        level: 'warning',
      });
      continue;
    }
    back += await blockToStaticMarkup(handler, c, response);

    // Nesting applies to all not just toggles
    if (
      handleChildren ||
      (c.has_children && c.type !== 'toggle' && c.type !== 'bulleted_list_item')
    ) {
      back += await handler.getBackSide(c);
    }
  }
  return back;
};
