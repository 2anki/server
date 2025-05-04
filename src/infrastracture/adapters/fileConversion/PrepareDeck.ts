import getDeckFilename from '../../../lib/anki/getDeckFilename';
import { DeckParser, DeckParserInput } from '../../../lib/parser/DeckParser';
import Deck from '../../../lib/parser/Deck';
import {
  isHTMLFile,
  isImageFile,
  isPDFFile,
  isPPTFile,
  isXLSXFile,
} from '../../../lib/storage/checks';
import { convertPDFToHTML } from './convertPDFToHTML';
import { convertPPTToPDF } from './ConvertPPTToPDF';
import { convertImageToHTML } from './convertImageToHTML';
import { convertPDFToImages } from './convertPDFToImages';
import { convertXLSXToHTML } from './convertXLSXToHTML';

interface PrepareDeckResult {
  name: string;
  apkg: Buffer;
  deck: Deck[];
}

export async function PrepareDeck(
  input: DeckParserInput
): Promise<PrepareDeckResult> {
  const convertedFiles = [];

  for (const file of input.files) {
    if (!file.contents) {
      continue;
    }

    if (isXLSXFile(file.name)) {
      const htmlContent = convertXLSXToHTML(file.contents as Buffer, file.name);
      convertedFiles.push({
        name: `${file.name}.html`,
        contents: Buffer.from(htmlContent),
      });
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
      convertedFiles.push({
        name: `${file.name}.html`,
        contents: convertedImageContents,
      });
    }

    if (!isPDFFile(file.name) && !isPPTFile(file.name)) continue;

    if (
      isPDFFile(file.name) &&
      input.noLimits &&
      input.settings.vertexAIPDFQuestions &&
      input.settings.processPDFs !== false
    ) {
      const htmlContent = await convertPDFToHTML(
        file.contents.toString('base64')
      );
      convertedFiles.push({
        name: `${file.name}.html`,
        contents: Buffer.from(htmlContent),
      });
    } else if (isPPTFile(file.name)) {
      const pdContents = await convertPPTToPDF(
        file.name,
        file.contents,
        input.workspace
      );

      const convertedContents = await convertPDFToImages({
        name: file.name,
        workspace: input.workspace,
        noLimits: input.noLimits,
        contents: pdContents,
        settings: input.settings,
      });
      convertedFiles.push({
        name: `${file.name}.html`,
        contents: convertedContents,
      });
    } else if (isPDFFile(file.name) && input.settings.processPDFs !== false) {
      const convertedContents = await convertPDFToImages({
        name: file.name,
        workspace: input.workspace,
        noLimits: input.noLimits,
        contents: file.contents,
        settings: input.settings,
      });
      convertedFiles.push({
        name: `${file.name}.html`,
        contents: convertedContents,
      });
    }
  }

  input.files.push(...convertedFiles);
  const parser = new DeckParser(input);

  if (parser.totalCardCount() === 0) {
    if (convertedFiles.length > 0) {
      const htmlFile = convertedFiles.find((file) => isHTMLFile(file.name));
      parser.processFirstFile(htmlFile?.name ?? input.name);
    } else {
      const apkg = await parser.tryExperimental();
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
