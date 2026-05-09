import { escapeAttribute, escapeHtml } from './escape';
import { NotionRichTextItem } from './types';

const wrap = (open: string, close: string, inner: string): string =>
  `${open}${inner}${close}`;

export const renderRichTextItem = (item: NotionRichTextItem): string => {
  if (item.type === 'equation' && item.equation?.expression != null) {
    return `\\(${escapeHtml(item.equation.expression)}\\)`;
  }
  let inner = escapeHtml(item.plain_text ?? '');
  const a = item.annotations ?? {};
  if (a.code) inner = wrap('<code>', '</code>', inner);
  if (a.bold) inner = wrap('<strong>', '</strong>', inner);
  if (a.italic) inner = wrap('<em>', '</em>', inner);
  if (a.strikethrough) inner = wrap('<del>', '</del>', inner);
  if (a.underline) inner = wrap('<u>', '</u>', inner);
  if (item.href != null && item.href !== '') {
    inner = `<a href="${escapeAttribute(item.href)}">${inner}</a>`;
  }
  return inner;
};

export const renderRichText = (
  items: NotionRichTextItem[] | undefined
): string => {
  if (items == null || items.length === 0) return '';
  return items.map(renderRichTextItem).join('');
};

export const renderPlainText = (
  items: NotionRichTextItem[] | undefined
): string => {
  if (items == null) return '';
  return items.map((item) => item.plain_text ?? '').join('');
};
