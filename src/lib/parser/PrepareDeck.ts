import getDeckFilename from '../anki/getDeckFilename';
import { DeckParser, DeckParserInput } from './DeckParser';
import Deck from './Deck';
import {
  isHTMLFile,
  isImageFile,
  isPDFFile,
  isPPTFile,
} from '../storage/checks';
import { convertPDFToHTML } from './experimental/VertexAPI/convertPDFToHTML';
import { convertPDFToImages } from '../pdf/convertPDFToImages';
import { convertPPTToPDF } from '../pdf/ConvertPPTToPDF';
import { convertImageToHTML } from './experimental/VertexAPI/convertImageToHTML';

interface PrepareDeckResult {
  name: string;
  apkg: Buffer;
  deck: Deck[];
}

export async function PrepareDeck(
  input: DeckParserInput
): Promise<PrepareDeckResult> {
  const convertedImageFiles = [];

  for (const file of input.files) {
    if (!file.contents) {
      continue;
    }

    if (
      isImageFile(file.name) &&
      input.settings.imageQuizHtmlToAnki &&
      input.noLimits
    ) {
      const convertedImageContents = await convertImageToHTML(
        file.contents?.toString('base64')
      );
      convertedImageFiles.push({
        name: `${file.name}.html`,
        contents: convertedImageContents,
      });
    }

    if (!isPDFFile(file.name) && !isPPTFile(file.name)) continue;

    if (
      isPDFFile(file.name) &&
      input.noLimits &&
      input.settings.vertexAIPDFQuestions
    ) {
      file.contents = await convertPDFToHTML(file.contents.toString('base64'));
    } else {
      if (isPPTFile(file.name)) {
        file.contents = await convertPPTToPDF(
          file.name,
          file.contents,
          input.workspace
        );
      }

      file.contents = await convertPDFToImages({
        name: file.name,
        workspace: input.workspace,
        noLimits: input.noLimits,
        contents: file.contents,
      });
    }
  }

  input.files.push(...convertedImageFiles);
  const parser = new DeckParser(input);

  if (parser.totalCardCount() === 0) {
    if (convertedImageFiles.length > 0) {
      const htmlFile = convertedImageFiles.find((file) =>
        isHTMLFile(file.name)
      );
      parser.processFirstFile(htmlFile?.name ?? input.name);
    } else {
      const apkg = await parser.tryExperimental(input.workspace);
      return {
        name: getDeckFilename(parser.name ?? input.name),
        apkg,
        deck: parser.payload,
      };
    }
  }

  const apkg = await parser.build(input.workspace);
  return {
    name: getDeckFilename(parser.name),
    apkg,
    deck: parser.payload,
  };
}
