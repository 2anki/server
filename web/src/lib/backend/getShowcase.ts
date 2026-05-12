import { get } from './api';

export interface ShowcaseBlock {
  id: string;
  type: string;
  hasChildren: boolean;
  canExpand: boolean;
  html: string;
  summaryHtml?: string;
  childrenHtml?: string;
}

export interface ShowcaseCard {
  id: number;
  ord: number;
  templateName: string;
  deckName: string;
  deckPath: string[];
  noteTypeName: string;
  css: string;
  front: string;
  back: string;
}

export interface ShowcaseData {
  pageTitle: string;
  notionBlocks: ShowcaseBlock[];
  ankiCards: ShowcaseCard[];
  populatedAt: string;
}

export async function getShowcase(): Promise<ShowcaseData | null> {
  try {
    return (await get('/api/showcase')) as ShowcaseData;
  } catch {
    return null;
  }
}
