import type { CheerioAPI } from 'cheerio';
import type { Element } from 'domhandler';

import CardOption from './Settings';

export function findNotionToggleLists(
  dom: CheerioAPI,
  context: Pick<CardOption, 'isCherry' | 'disableIndentedBulletPoints'> & {
    isAll: boolean;
  }
): Element[] {
  if (context.isCherry) {
    return dom('.toggle').toArray();
  }
  if (context.isAll) {
    return dom('.toggle')
      .toArray()
      .filter((el) => dom(el).parents('.toggle').length === 0);
  }
  if (!context.disableIndentedBulletPoints) {
    return dom('.page-body > ul').toArray();
  }
  return dom('.page-body > ul:not(.bulleted-list)').toArray();
}
