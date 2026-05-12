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
    const data = (await get('/api/showcase')) as ShowcaseData;
    if (!Array.isArray(data?.notionBlocks) || !Array.isArray(data?.ankiCards)) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}
