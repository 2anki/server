import { isFullBlock } from '@notionhq/client';
import {
  BulletedListItemBlockObjectResponse,
  CalloutBlockObjectResponse,
  CodeBlockObjectResponse,
  GetBlockResponse,
  NumberedListItemBlockObjectResponse,
  ParagraphBlockObjectResponse,
  QuoteBlockObjectResponse,
  RichTextItemResponse,
  TemplateBlockObjectResponse,
  ToDoBlockObjectResponse,
  ToggleBlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { getHeadingText } from './getHeadingText';

export const getRichTextFromBlock = (
  block: GetBlockResponse
): undefined | Array<RichTextItemResponse> => {
  if (!isFullBlock(block)) {
    return undefined;
  }
  switch (block.type) {
    case 'toggle':
      return (block as ToggleBlockObjectResponse).toggle.rich_text;
    case 'bulleted_list_item':
      return (block as BulletedListItemBlockObjectResponse).bulleted_list_item
        .rich_text;
    case 'numbered_list_item':
      return (block as NumberedListItemBlockObjectResponse).numbered_list_item
        .rich_text;
    case 'heading_1':
    case 'heading_2':
    case 'heading_3':
      return getHeadingText(block);
    case 'paragraph':
      return (block as ParagraphBlockObjectResponse).paragraph.rich_text;
    case 'quote':
      return (block as QuoteBlockObjectResponse).quote.rich_text;
    case 'to_do':
      return (block as ToDoBlockObjectResponse).to_do.rich_text;
    case 'template':
      return (block as TemplateBlockObjectResponse).template.rich_text;
    case 'code':
      return (block as CodeBlockObjectResponse).code.rich_text;
    case 'callout':
      return (block as CalloutBlockObjectResponse).callout.rich_text;
    default:
      return undefined;
  }
};
