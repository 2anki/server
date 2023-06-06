import { RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';

export interface RichBlock {
  rich_text: Array<RichTextItemResponse>;
}

export const richObjectToString = (block: RichBlock) => {
  return block.rich_text.map((t) => t.plain_text).join('');
};
