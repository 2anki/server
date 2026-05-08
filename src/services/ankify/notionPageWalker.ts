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

interface NotionParagraphBlock {
  type: 'paragraph';
  paragraph: { rich_text: RichTextItem[] };
}

interface NotionBulletedListItemBlock {
  type: 'bulleted_list_item';
  bulleted_list_item: { rich_text: RichTextItem[] };
}

type NotionChildBlock =
  | NotionToggleBlock
  | NotionParagraphBlock
  | NotionBulletedListItemBlock
  | { type: string };

export interface WalkedNotionFlashcard {
  notion_block_id: string;
  notion_last_edited_at: Date;
  front: string;
  back: string;
}

export type NotionBlockChildrenFetcher = (
  blockId: string
) => Promise<NotionChildBlock[]>;

const renderRichText = (items: RichTextItem[] | undefined): string => {
  if (items == null) {
    return '';
  }
  return items
    .map((item) => item.plain_text ?? '')
    .join('')
    .trim();
};

const renderChildAsBackText = async (
  toggle: NotionToggleBlock,
  fetchChildren: NotionBlockChildrenFetcher
): Promise<string> => {
  if (!toggle.has_children) {
    return '';
  }
  const children = await fetchChildren(toggle.id);
  const lines: string[] = [];
  for (const child of children) {
    if (child.type === 'paragraph') {
      lines.push(
        renderRichText((child as NotionParagraphBlock).paragraph.rich_text)
      );
    } else if (child.type === 'bulleted_list_item') {
      const text = renderRichText(
        (child as NotionBulletedListItemBlock).bulleted_list_item.rich_text
      );
      if (text.length > 0) {
        lines.push(`• ${text}`);
      }
    }
  }
  return lines.filter((line) => line.length > 0).join('\n');
};

export const walkNotionPageForFlashcards = async (
  pageId: string,
  fetchChildren: NotionBlockChildrenFetcher
): Promise<WalkedNotionFlashcard[]> => {
  const topLevel = await fetchChildren(pageId);
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
    const back = await renderChildAsBackText(toggle, fetchChildren);
    cards.push({
      notion_block_id: toggle.id,
      notion_last_edited_at: new Date(toggle.last_edited_time),
      front,
      back,
    });
  }
  return cards;
};
