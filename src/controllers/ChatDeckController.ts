import { Request, Response } from 'express';
import { ChatDeckUseCase } from '../usecases/chat/ChatDeckUseCase';

const MAX_DECK_NAME_LENGTH = 120;
const MAX_CARDS = 200;

function isValidCard(item: unknown): item is { front: string; back: string } {
  return (
    item != null &&
    typeof item === 'object' &&
    typeof (item as Record<string, unknown>).front === 'string' &&
    typeof (item as Record<string, unknown>).back === 'string'
  );
}

class ChatDeckController {
  constructor(private readonly useCase: ChatDeckUseCase) {}

  async generate(req: Request, res: Response) {
    const rawDeckName = req.body?.deckName;
    const deckName = typeof rawDeckName === 'string' ? rawDeckName.trim() : '';

    if (deckName.length === 0) {
      res.status(400).json({ error: 'deckName is required' });
      return;
    }

    if (deckName.length > MAX_DECK_NAME_LENGTH) {
      res.status(400).json({ error: `deckName must be ${MAX_DECK_NAME_LENGTH} characters or fewer` });
      return;
    }

    const rawCards = req.body?.cards;

    if (!Array.isArray(rawCards)) {
      res.status(400).json({ error: 'cards must be a non-empty array' });
      return;
    }

    if (rawCards.length === 0) {
      res.status(400).json({ error: 'cards must be a non-empty array' });
      return;
    }

    if (rawCards.length > MAX_CARDS) {
      res.status(400).json({ error: `cards must have at most ${MAX_CARDS} items` });
      return;
    }

    if (!rawCards.every(isValidCard)) {
      res.status(400).json({ error: 'each card must have string front and back fields' });
      return;
    }

    const buffer = await this.useCase.execute({
      cards: rawCards.map((c) => ({ front: c.front, back: c.back })),
      deckName,
    });

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${deckName}.apkg"`);
    res.send(buffer);
  }
}

export default ChatDeckController;
