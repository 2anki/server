import { Response } from 'express';
import { parseCard } from './parseCard';
import { DeckCard } from './processChunk';

export function handlePartialJson(
  trimmed: string,
  currentDeckInfo: DeckCard[],
  res: Response
) {
  const matches = trimmed.match(/\{[^}]+\}/g);
  if (matches) {
    matches.forEach((match) => {
      try {
        const card = parseCard(match);
        if (card) {
          currentDeckInfo.push(card);
          res.write(`event: card\ndata: ${JSON.stringify(card)}\n\n`);
          console.log('[CARD DATA]', JSON.stringify(card, null, 2));
        }
      } catch {
        // Ignore invalid JSON in matches
      }
    });
  }
}
