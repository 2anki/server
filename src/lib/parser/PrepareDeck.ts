import fs from 'fs';
import path from 'path';

import getDeckFilename from '../anki/getDeckFilename';
import { DeckParser, DeckParserInput } from './DeckParser';
import Deck from './Deck';
import { isPDFFile } from '../storage/checks';
import { convertPDFToHTML } from './experimental/VertexAPI/convertPDFToHTML';
import { convertPDFToImages } from './pdf/convertPDFToImages';

interface PrepareDeckResult {
  name: string;
  apkg: Buffer;
  deck: Deck[];
}

export async function PrepareDeck(
  input: DeckParserInput
): Promise<PrepareDeckResult> {
  for (const file of input.files) {
    if (!isPDFFile(file.name) || !file.contents) continue;

    if (input.noLimits && input.settings.vertexAIPDFQuestions) {
      file.contents = await convertPDFToHTML(file.contents.toString('base64'));
    } else {
      file.contents = await convertPDFToImages({
        name: file.name,
        workspace: input.workspace,
        noLimits: input.noLimits,
        contents: file.contents,
      });
      fs.writeFileSync(
        path.join(input.workspace.location, 'input.html'),
        file.contents.toString()
      );
    }
  }

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
