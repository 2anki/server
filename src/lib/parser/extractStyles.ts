import type { CheerioAPI } from 'cheerio';

/**
 * Extracts the styles from the page and removes formatting issues.
 *
 * Removing list-style-type changes (makes nested toggles work)
 * Removing white-space: pre-wrap (don't remember why)
 *
 * @param page
 */
export function extractStyles(page: CheerioAPI) {
  let style = page('style').html();
  if (!style) {
    return null;
  }

  return style
    .replace(/white-space: pre-wrap;/g, '')
    .replace(/list-style-type: none;/g, '');
}
