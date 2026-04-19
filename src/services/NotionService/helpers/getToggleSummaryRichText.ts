import {
  BlockObjectResponse,
  RichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { isToggleHeading } from './isToggleHeading';

/**
 * Returns the rich_text that represents the summary/front of a toggleable
 * block (regular toggle or toggleable heading) — or null for anything else.
 * Keeps the toggle vs heading-toggle narrowing in one place so callers do
 * not have to switch on block.type themselves.
 */
export function getToggleSummaryRichText(
  block: BlockObjectResponse
): RichTextItemResponse[] | null {
  if (block.type === 'toggle') {
    return block.toggle.rich_text;
  }
  if (!isToggleHeading(block)) {
    return null;
  }
  switch (block.type) {
    case 'heading_1':
      return block.heading_1.rich_text;
    case 'heading_2':
      return block.heading_2.rich_text;
    case 'heading_3':
      return block.heading_3.rich_text;
    case 'heading_4':
      return block.heading_4.rich_text;
    default:
      return null;
  }
}
