import { Response } from 'express';
import { cleanLine } from './cleanLine';
import { parseCard } from './parseCard';
import { handlePartialJson } from './handlePartialJson';

export interface DeckCard {
  name?: string;
  front?: string;
  back?: string;
  deck?: string;
  tags?: string[];
  media?: string[];
}

const handleValidCard = (
  card: any,
  currentDeckInfo: DeckCard[],
  res: Response
) => {
  if (card) {
    currentDeckInfo.push(card);
    res.write(`event: card\ndata: ${JSON.stringify(card)}\n\n`);
    if (res.flush) res.flush();
    console.log('[CARD DATA]', JSON.stringify(card, null, 2));
  }
};

const processLine = (
  line: string,
  currentDeckInfo: DeckCard[],
  res: Response
) => {
  const trimmed = cleanLine(line);
  if (!trimmed) return;

  try {
    const card = parseCard(trimmed);
    handleValidCard(card, currentDeckInfo, res);
  } catch {
    handlePartialJson(trimmed, currentDeckInfo, res);
  }
};

export const processChunk = (
  currentDeckInfo: DeckCard[],
  text: string,
  res: Response
) => {
  const lines = text.split('\n');

  // Process each line
  lines.forEach((line) => processLine(line, currentDeckInfo, res));
};
