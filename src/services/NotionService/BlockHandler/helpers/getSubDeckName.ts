import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { isFullBlock } from '@notionhq/client';
import { getChildPageBlock } from '../../blocks/helpers/getChildPageBlock';
import { getToggleBlock } from '../../blocks/helpers/getToggleBlock';
import { richObjectToString } from '../../blocks/helpers/richObjectToString';
import { getHeading } from '../../blocks/helpers/getHeading';
import { getChildDatabaseBlock } from '../../blocks/helpers/getChildDatabaseBlock';

const getSubDeckName = (
  block: BlockObjectResponse | { title: string }
): string => {
  let subDeckName = 'Untitled';
  if ('title' in block) {
    return block.title;
  }

  if (isFullBlock(block as BlockObjectResponse)) {
    switch (block.type) {
      case 'child_page':
        return getChildPageBlock(block).title;
      case 'child_database':
        return getChildDatabaseBlock(block).title;
      case 'toggle':
        return richObjectToString(getToggleBlock(block));
      case 'heading_1':
      case 'heading_2':
      case 'heading_3':
        const heading = getHeading(block);
        if (heading) {
          return richObjectToString(heading);
        }
      case 'column_list':
      case 'bulleted_list_item':
      case 'numbered_list_item':
        return subDeckName;
    }
  }
  return subDeckName;
};

export default getSubDeckName;
