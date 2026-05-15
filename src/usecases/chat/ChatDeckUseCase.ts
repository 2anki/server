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

function randomDeckId(): number {
  const hex = createHash('sha1').update(randomUUID()).digest('hex').slice(0, 13);
  return Number.parseInt(hex, 16) % 1e13;
}

const CLOZE_PATTERN = /\{\{c\d+::/;

export function looksLikeCloze(front: string): boolean {
  return CLOZE_PATTERN.test(front);
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
          id: randomDeckId(),
          settings: {
            template: 'specialstyle',
            clozeModelName: 'n2a-cloze',
            basicModelName: 'n2a-basic',
            inputModelName: 'n2a-input',
            useNotionId: false,
          },
          cards: cards.map((c, index) => ({
            name: c.front,
            back: c.back,
            tags: [],
            cloze: looksLikeCloze(c.front),
            number: index,
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
