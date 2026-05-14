import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import CustomExporter from '../../lib/parser/exporters/CustomExporter';

export interface ChatDeckCard {
  front: string;
  back: string;
}

export interface ChatDeckInput {
  cards: ChatDeckCard[];
  deckName: string;
}

function deterministicId(input: string): number {
  const hex = createHash('sha1').update(input).digest('hex').slice(0, 13);
  return Number.parseInt(hex, 16) % 1e13;
}

export class ChatDeckUseCase {
  async execute(input: ChatDeckInput): Promise<Buffer> {
    const { cards, deckName } = input;
    const workspaceDir = path.join(os.tmpdir(), `chat-deck-${randomUUID()}`);
    fs.mkdirSync(workspaceDir, { recursive: true });

    try {
      const deckInfo = [
        {
          name: deckName,
          image: '',
          style: null,
          id: deterministicId(deckName),
          settings: {
            template: 'specialstyle',
            clozeModelName: 'n2a-cloze',
            basicModelName: 'n2a-basic',
            inputModelName: 'n2a-input',
            useNotionId: true,
          },
          cards: cards.map((c) => ({
            name: c.front,
            back: c.back,
            tags: [],
            cloze: false,
            number: 0,
            enableInput: false,
            answer: '',
            media: [],
          })),
        },
      ];

      const exporter = new CustomExporter(deckName, workspaceDir);
      exporter.configure(deckInfo as never);
      return await exporter.save();
    } finally {
      fs.rmSync(workspaceDir, { recursive: true, force: true });
    }
  }
}
