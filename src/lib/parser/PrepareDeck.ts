import { File } from '../anki/zip';
import Settings from './Settings';
import getDeckFilename from '../anki/getDeckFilename';
import { DeckParser } from './DeckParser';
import Deck from './Deck';

interface PrepareDeckResult {
  name: string;
  apkg: Buffer;
  deck: Deck[];
}

export async function PrepareDeck(
  fileName: string,
  files: File[],
  settings: Settings
): Promise<PrepareDeckResult> {
  const parser = new DeckParser(fileName, settings, files);

  if (parser.totalCardCount() === 0) {
    const apkg = await parser.tryExperimental();
    return {
      name: getDeckFilename(parser.name ?? fileName),
      apkg,
      deck: parser.payload,
    };
  }

  const apkg = await parser.build();
  return {
    name: getDeckFilename(parser.name),
    apkg,
    deck: parser.payload,
  };
}
