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

interface NotionImageBlock {
  id: string;
  type: 'image';
  image:
    | { type: 'external'; external: { url: string } }
    | { type: 'file'; file: { url: string; expiry_time?: string } };
}

type NotionChildBlock =
  | NotionToggleBlock
  | NotionParagraphBlock
  | NotionBulletedListItemBlock
  | NotionImageBlock
  | { type: string; id?: string };

export type WalkedImageSource = 'external' | 'file';

export interface WalkedNotionImageRef {
  block_id: string;
  source: WalkedImageSource;
  url: string;
  filename?: string;
}

export interface WalkedNotionFlashcard {
  notion_block_id: string;
  notion_last_edited_at: Date;
  front: string;
  back: string;
  images: WalkedNotionImageRef[];
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

const buildMediaFilename = (image: NotionImageBlock): string => {
  const url = image.image.type === 'file'
    ? image.image.file.url
    : image.image.external.url;
  const cleanedUrl = url.split('?')[0];
  const extMatch = /\.([a-zA-Z0-9]{1,5})$/.exec(cleanedUrl);
  const ext = extMatch == null ? 'png' : extMatch[1].toLowerCase();
  return `ankify-${image.id}.${ext}`;
};

const renderImageHtml = (image: NotionImageBlock): string => {
  if (image.image.type === 'external') {
    return `<img src="${image.image.external.url}">`;
  }
  return `<img src="${buildMediaFilename(image)}">`;
};

const buildImageRef = (image: NotionImageBlock): WalkedNotionImageRef => {
  if (image.image.type === 'file') {
    return {
      block_id: image.id,
      source: 'file',
      url: image.image.file.url,
      filename: buildMediaFilename(image),
    };
  }
  return {
    block_id: image.id,
    source: 'external',
    url: image.image.external.url,
  };
};

const renderToggleBack = async (
  toggle: NotionToggleBlock,
  fetchChildren: NotionBlockChildrenFetcher
): Promise<{ back: string; images: WalkedNotionImageRef[] }> => {
  if (!toggle.has_children) {
    return { back: '', images: [] };
  }
  const children = await fetchChildren(toggle.id);
  const lines: string[] = [];
  const images: WalkedNotionImageRef[] = [];
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
    } else if (child.type === 'image' && child.id != null) {
      const imageBlock = child as NotionImageBlock;
      lines.push(renderImageHtml(imageBlock));
      images.push(buildImageRef(imageBlock));
    }
  }
  return {
    back: lines.filter((line) => line.length > 0).join('\n'),
    images,
  };
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
    const { back, images } = await renderToggleBack(toggle, fetchChildren);
    cards.push({
      notion_block_id: toggle.id,
      notion_last_edited_at: new Date(toggle.last_edited_time),
      front,
      back,
      images,
    });
  }
  return cards;
};

