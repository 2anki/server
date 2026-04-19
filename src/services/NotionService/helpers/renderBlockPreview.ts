import {
  BlockObjectResponse,
  RichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints';

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function applyAnnotations(
  item: RichTextItemResponse,
  text: string
): string {
  let html = escapeHtml(text);
  const { annotations } = item;
  if (annotations.code) html = `<code>${html}</code>`;
  if (annotations.bold) html = `<strong>${html}</strong>`;
  if (annotations.italic) html = `<em>${html}</em>`;
  if (annotations.underline) html = `<u>${html}</u>`;
  if (annotations.strikethrough) html = `<s>${html}</s>`;
  if (item.href) {
    html = `<a href="${escapeHtml(item.href)}" target="_blank" rel="noreferrer">${html}</a>`;
  }
  return html;
}

function richText(items: RichTextItemResponse[] | undefined): string {
  if (!items || items.length === 0) return '';
  return items
    .map((item) => applyAnnotations(item, item.plain_text))
    .join('');
}

function imageUrl(block: Extract<BlockObjectResponse, { type: 'image' }>):
  | string
  | null {
  if (block.image.type === 'external') return block.image.external.url;
  if (block.image.type === 'file') return block.image.file.url;
  return null;
}

function isToggleableHeading(block: BlockObjectResponse): boolean {
  switch (block.type) {
    case 'heading_1':
      return block.heading_1.is_toggleable === true;
    case 'heading_2':
      return block.heading_2.is_toggleable === true;
    case 'heading_3':
      return block.heading_3.is_toggleable === true;
    case 'heading_4':
      return block.heading_4.is_toggleable === true;
    default:
      return false;
  }
}

/**
 * A block the preview UI lets the user expand to fetch its children lazily.
 * For v1 only toggle + toggleable headings — the common cases where users
 * expect Notion-style click-to-reveal behaviour.
 */
export function isExpandable(block: BlockObjectResponse): boolean {
  if (block.type === 'toggle') return true;
  return isToggleableHeading(block);
}

/**
 * Render the "summary" HTML for an expandable block — i.e. the content
 * the client will put inside a <summary> element. Intentionally does NOT
 * include the <details> wrapper; the client owns the open/close state.
 */
export function renderBlockSummary(block: BlockObjectResponse): string {
  switch (block.type) {
    case 'toggle':
      return richText(block.toggle.rich_text);
    case 'heading_1':
      return `<h1>${richText(block.heading_1.rich_text)}</h1>`;
    case 'heading_2':
      return `<h2>${richText(block.heading_2.rich_text)}</h2>`;
    case 'heading_3':
      return `<h3>${richText(block.heading_3.rich_text)}</h3>`;
    case 'heading_4':
      return `<h4>${richText(block.heading_4.rich_text)}</h4>`;
    default:
      return '';
  }
}

/**
 * Render a single Notion block as lightweight HTML for the preview page.
 * Intentionally does NOT:
 *  - recurse into children (toggle/sub-page content is fetched lazily
 *    by the client on expand — see isExpandable above)
 *  - download media (images point at Notion's signed URLs directly — fine
 *    for a short preview session)
 *  - apply any CardOption-aware formatting (preview is raw)
 *
 * For expandable blocks this returns an empty string; the client wraps
 * the summary HTML (from renderBlockSummary) in its own <details>.
 *
 * Unsupported block types render as an empty string so the stream still
 * returns the block id but nothing visible.
 */
export function renderBlockPreview(block: BlockObjectResponse): string {
  if (isExpandable(block)) return '';
  switch (block.type) {
    case 'paragraph':
      return `<p>${richText(block.paragraph.rich_text)}</p>`;
    case 'heading_1':
      return `<h1>${richText(block.heading_1.rich_text)}</h1>`;
    case 'heading_2':
      return `<h2>${richText(block.heading_2.rich_text)}</h2>`;
    case 'heading_3':
      return `<h3>${richText(block.heading_3.rich_text)}</h3>`;
    case 'heading_4':
      return `<h4>${richText(block.heading_4.rich_text)}</h4>`;
    case 'bulleted_list_item':
      return `<ul><li>${richText(block.bulleted_list_item.rich_text)}</li></ul>`;
    case 'numbered_list_item':
      return `<ol><li>${richText(block.numbered_list_item.rich_text)}</li></ol>`;
    case 'to_do': {
      const checked = block.to_do.checked ? ' checked' : '';
      return `<label><input type="checkbox" disabled${checked} /> ${richText(block.to_do.rich_text)}</label>`;
    }
    case 'quote':
      return `<blockquote>${richText(block.quote.rich_text)}</blockquote>`;
    case 'code': {
      const lang = block.code.language ?? '';
      return `<pre><code data-lang="${escapeHtml(lang)}">${richText(block.code.rich_text)}</code></pre>`;
    }
    case 'callout': {
      const emoji =
        block.callout.icon?.type === 'emoji' ? block.callout.icon.emoji : '';
      return `<aside><span aria-hidden="true">${escapeHtml(emoji)}</span> ${richText(block.callout.rich_text)}</aside>`;
    }
    case 'divider':
      return `<hr />`;
    case 'image': {
      const url = imageUrl(block);
      if (!url) return '';
      const caption = richText(block.image.caption);
      return `<figure><img src="${escapeHtml(url)}" alt="" loading="lazy" />${
        caption ? `<figcaption>${caption}</figcaption>` : ''
      }</figure>`;
    }
    case 'bookmark':
      return `<p><a href="${escapeHtml(block.bookmark.url)}" target="_blank" rel="noreferrer">${escapeHtml(block.bookmark.url)}</a></p>`;
    case 'equation':
      return `<p><code>${escapeHtml(block.equation.expression)}</code></p>`;
    case 'child_page':
      return `<p><strong>📄 ${escapeHtml(block.child_page.title)}</strong> <em>(sub-page)</em></p>`;
    case 'child_database':
      return `<p><strong>🗃 ${escapeHtml(block.child_database.title)}</strong> <em>(database)</em></p>`;
    default:
      return '';
  }
}
