import cheerio from 'cheerio';

import CardOption from './Settings';

export function findNotionToggleLists(
  dom: cheerio.Root,
  context: Pick<
    CardOption,
    'isAll' | 'isCherry' | 'disableIndentedBulletPoints'
  >
): cheerio.Element[] {
  if (context.isCherry || context.isAll) {
    return dom('.toggle').toArray();
  }
  if (!context.disableIndentedBulletPoints) {
    return dom('.page-body > ul').toArray();
  }
  return dom('.page-body > ul:not(.bulleted-list)').toArray();
}
