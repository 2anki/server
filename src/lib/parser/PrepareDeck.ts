import getDeckFilename from '../anki/getDeckFilename';
import { DeckParser, DeckParserInput } from './DeckParser';
import Deck from './Deck';

interface PrepareDeckResult {
  name: string;
  apkg: Buffer;
  deck: Deck[];
}

export async function PrepareDeck(
  input: DeckParserInput
): Promise<PrepareDeckResult> {
  const parser = new DeckParser(input);

  if (parser.totalCardCount() === 0) {
    const apkg = await parser.tryExperimental(input.workspace);
    return {
      name: getDeckFilename(parser.name ?? input.name),
      apkg,
      deck: parser.payload,
    };
  }

  const apkg = await parser.build(input.workspace);
  return {
    name: getDeckFilename(parser.name),
    apkg,
    deck: parser.payload,
  };
}
