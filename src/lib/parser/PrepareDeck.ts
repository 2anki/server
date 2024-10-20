import getDeckFilename from '../anki/getDeckFilename';
import { DeckParser, DeckParserInput } from './DeckParser';
import Deck from './Deck';
import { isPDFFile } from '../storage/checks';
import { convertPDFToHTML } from './experimental/VertexAPI/convertPDFToHTML';

interface PrepareDeckResult {
  name: string;
  apkg: Buffer;
  deck: Deck[];
}

export async function PrepareDeck(
  input: DeckParserInput
): Promise<PrepareDeckResult> {
  if (input.noLimits && input.settings.vertexAIPDFQuestions) {
    // Check for PDF files and convert their contents to HTML
    for (const file of input.files) {
      if (isPDFFile(file.name) && file.contents) {
        file.contents = await convertPDFToHTML(
          file.contents.toString('base64')
        );
      }
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
