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
    // When isAll is true, find all .toggle elements including nested ones
    // This ensures nested toggles are treated as separate cards
    return dom('.toggle').toArray();
  }
  if (!context.disableIndentedBulletPoints) {
    return dom('.page-body > ul').toArray();
  }
  return dom('.page-body > ul:not(.bulleted-list)').toArray();
}
