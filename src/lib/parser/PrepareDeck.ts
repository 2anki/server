import { File } from '../anki/zip';
import Settings from './Settings';
import getDeckFilename from '../anki/getDeckFilename';
import { DeckParser } from './DeckParser';
import Deck from './Deck';
import Workspace from './WorkSpace';

interface PrepareDeckOutput {
  name: string;
  apkg: Buffer;
  deck: Deck[];
  workspace?: Workspace;
}

interface PrepareDeckInput {
  fileName: string;
  files: File[];
  settings: Settings;
}

export async function PrepareDeck({
  fileName,
  files,
  settings,
}: PrepareDeckInput): Promise<PrepareDeckOutput> {
  const parser = new DeckParser(fileName, settings, files);
  const ws = new Workspace(true, 'fs');

  if (parser.totalCardCount() === 0) {
    const apkg = await parser.tryExperimental(ws);
    return {
      name: getDeckFilename(parser.name ?? fileName),
      apkg,
      deck: parser.payload,
      workspace: ws,
    };
  }

  const apkg = await parser.build(ws);
  return {
    name: getDeckFilename(parser.name),
    apkg,
    deck: parser.payload,
    workspace: ws,
  };
}
