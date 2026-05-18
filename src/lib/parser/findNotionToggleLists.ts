import type { CheerioAPI } from 'cheerio';
import type { Element } from 'domhandler';

import CardOption from './Settings';

const MCQ_MIN_OPTIONS = 2;
const MCQ_MAX_OPTIONS = 7;

function collectListItems(element: Element, dom: CheerioAPI): Element[] {
  return dom(element).find('ul.to-do-list > li, ul.bulleted-list > li').toArray() as Element[];
}

function checkedTodoIndex(items: Element[], dom: CheerioAPI): number {
  const checkedIndices: number[] = [];
  items.forEach((item, idx) => {
    if (dom(item).find('.checkbox-on').length > 0) {
      checkedIndices.push(idx);
    }
  });
  if (checkedIndices.length === 1) return checkedIndices[0];
  return -1;
}

function fullyBoldedIndex(items: Element[], dom: CheerioAPI): number {
  const boldIndices: number[] = [];
  items.forEach((item, idx) => {
    const $item = dom(item);
    const strongText = $item.find('strong').text().trim();
    const itemText = $item.text().trim();
    if (strongText.length > 0 && strongText === itemText) {
      boldIndices.push(idx);
    }
  });
  if (boldIndices.length === 1) return boldIndices[0];
  return -1;
}

export function isMCQ(element: Element, dom: CheerioAPI): number {
  const items = collectListItems(element, dom);
  if (items.length < MCQ_MIN_OPTIONS || items.length > MCQ_MAX_OPTIONS) return -1;

  const hasTodoItems = dom(element).find('ul.to-do-list > li').length > 0;
  if (hasTodoItems) {
    return checkedTodoIndex(items, dom);
  }

  return fullyBoldedIndex(items, dom);
}

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
