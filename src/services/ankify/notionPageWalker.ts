import {
  NotionRenderableBlock,
  WalkedMediaKind,
  WalkedNotionMediaRef,
  renderNotionBlocks,
} from '../../lib/notion-render';

interface RichTextItem {
  plain_text?: string;
}

interface NotionToggleBlock {
  id: string;
  type: 'toggle';
  last_edited_time: string;
  has_children: boolean;
  toggle: { rich_text: RichTextItem[] };
}

type NotionTopLevelBlock = NotionToggleBlock | { type: string; id?: string };

export type { WalkedMediaKind, WalkedNotionMediaRef };

export interface WalkedNotionFlashcard {
  notion_block_id: string;
  notion_last_edited_at: Date;
  front: string;
  back: string;
  media: WalkedNotionMediaRef[];
}

export type NotionBlockChildrenFetcher = (
  blockId: string
) => Promise<NotionRenderableBlock[]>;

const renderRichText = (items: RichTextItem[] | undefined): string => {
  if (items == null) return '';
  return items
    .map((item) => item.plain_text ?? '')
    .join('')
    .trim();
};

const renderToggleBack = async (
  toggle: NotionToggleBlock,
  fetchChildren: NotionBlockChildrenFetcher
): Promise<{ back: string; media: WalkedNotionMediaRef[] }> => {
  if (!toggle.has_children) {
    return { back: '', media: [] };
  }
  const children = await fetchChildren(toggle.id);
  const rendered = await renderNotionBlocks(children, fetchChildren);
  return { back: rendered.html, media: rendered.media };
};

export const walkNotionPageForFlashcards = async (
  pageId: string,
  fetchChildren: NotionBlockChildrenFetcher
): Promise<WalkedNotionFlashcard[]> => {
  const topLevel = (await fetchChildren(pageId)) as NotionTopLevelBlock[];
  const cards: WalkedNotionFlashcard[] = [];
  for (const block of topLevel) {
    if (block.type !== 'toggle') {
      continue;
    }
    const toggle = block as NotionToggleBlock;
    const front = renderRichText(toggle.toggle.rich_text);
    if (front.length === 0) {
      continue;
    }
    const { back, media } = await renderToggleBack(toggle, fetchChildren);
    cards.push({
      notion_block_id: toggle.id,
      notion_last_edited_at: new Date(toggle.last_edited_time),
      front,
      back,
      media,
    });
  }
  return cards;
};
