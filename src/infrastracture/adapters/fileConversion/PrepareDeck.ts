import getDeckFilename from '../../../lib/anki/getDeckFilename';
import { DeckParser, DeckParserInput } from '../../../lib/parser/DeckParser';
import Deck from '../../../lib/parser/Deck';
import {
  isHTMLFile,
  isImageFile,
  isMarkdownFile,
  isPDFFile,
  isPPTFile,
  isXLSXFile,
  isDocxFile,
} from '../../../lib/storage/checks';
import { convertPDFToHTML } from './convertPDFToHTML';
import { convertPPTToPDF } from './ConvertPPTToPDF';
import { convertImageToHTML } from './convertImageToHTML';
import { convertPDFToImages } from './convertPDFToImages';
import { convertXLSXToHTML } from './convertXLSXToHTML';
import { convertDocxToHTML } from './convertDocxToHTML';
import { generateDeckInfo } from '../../../lib/claude/ClaudeService';
import CustomExporter from '../../../lib/parser/exporters/CustomExporter';
import fs from 'fs';
import path from 'path';

interface PrepareDeckResult {
  name: string;
  apkg: Buffer;
  deck: Deck[];
}

async function convertFile(
  file: DeckParserInput['files'][number],
  input: DeckParserInput
) {
  if (!file.contents) return null;

  const t0 = Date.now();

  if (isXLSXFile(file.name)) {
    const result = {
      name: `${file.name}.html`,
      contents: Buffer.from(convertXLSXToHTML(file.contents as Buffer, file.name)),
    };
    console.log('[PrepareDeck] convertFile xlsx', { file: file.name, durationMs: Date.now() - t0 });
    return result;
  }

  if (isDocxFile(file.name) && input.settings.claudeAIFlashcards && input.noLimits) {
    const result = {
      name: `${file.name}.html`,
      contents: Buffer.from(await convertDocxToHTML(file.contents as Buffer)),
    };
    console.log('[PrepareDeck] convertFile docx', { file: file.name, durationMs: Date.now() - t0 });
    return result;
  }

  if (isImageFile(file.name) && input.settings.imageQuizHtmlToAnki && input.noLimits) {
    const result = {
      name: `${file.name}.html`,
      contents: await convertImageToHTML(file.contents?.toString('base64')),
    };
    console.log('[PrepareDeck] convertFile image', { file: file.name, durationMs: Date.now() - t0 });
    return result;
  }

  if (!isPDFFile(file.name) && !isPPTFile(file.name)) return null;

  if (
    isPDFFile(file.name) &&
    input.noLimits &&
    input.settings.vertexAIPDFQuestions &&
    input.settings.processPDFs !== false
  ) {
    const result = {
      name: `${file.name}.html`,
      contents: Buffer.from(
        await convertPDFToHTML(
          (file.contents as Buffer).toString('base64'),
          input.settings.userInstructions
        )
      ),
    };
    console.log('[PrepareDeck] convertFile pdf→html (vertex)', { file: file.name, durationMs: Date.now() - t0 });
    return result;
  }

  if (isPPTFile(file.name)) {
    const pdContents = await convertPPTToPDF(file.name, file.contents as Buffer, input.workspace);
    const result = {
      name: `${file.name}.html`,
      contents: await convertPDFToImages({
        name: file.name,
        workspace: input.workspace,
        noLimits: input.noLimits,
        contents: pdContents,
        settings: input.settings,
      }),
    };
    console.log('[PrepareDeck] convertFile ppt→pdf→images', { file: file.name, durationMs: Date.now() - t0 });
    return result;
  }

  if (isPDFFile(file.name) && input.settings.processPDFs !== false) {
    const result = {
      name: `${file.name}.html`,
      contents: await convertPDFToImages({
        name: file.name,
        workspace: input.workspace,
        noLimits: input.noLimits,
        contents: file.contents as Buffer,
        settings: input.settings,
      }),
    };
    console.log('[PrepareDeck] convertFile pdf→images', { file: file.name, durationMs: Date.now() - t0 });
    return result;
  }

  return null;
}

function deckPrefixFromFilePath(htmlFileName: string): string {
  const normalized = htmlFileName.replace(/\\/g, '/');
  const lastSlash = normalized.lastIndexOf('/');
  if (lastSlash < 0) return '';
  const dirParts = normalized.substring(0, lastSlash).split('/');
  return dirParts
    .map((p) => p.replace(/ [a-f0-9]{32}$/i, '').trim())
    .filter(Boolean)
    .join('::');
}

function mediaFilesForHtmlFile(htmlFileName: string, allMediaFiles: string[]): string[] {
  const normalized = htmlFileName.replace(/\\/g, '/');
  const lastSlash = normalized.lastIndexOf('/');
  const dir = lastSlash >= 0 ? normalized.substring(0, lastSlash) : '';
  const base = normalized
    .substring(lastSlash + 1)
    .replace(/\.html$/i, '')
    .replace(/ [a-f0-9]{32}$/i, '')
    .trim();
  const prefix = dir ? `${dir}/${base}/` : `${base}/`;
  return allMediaFiles.filter((m) => m.replace(/\\/g, '/').startsWith(prefix));
}

export async function PrepareDeck(
  input: DeckParserInput
): Promise<PrepareDeckResult> {
  const tTotal = Date.now();

  console.log('[PrepareDeck] start', {
    name: input.name,
    fileCount: input.files.length,
    fileNames: input.files.map((f) => f.name),
    claudeEnabled: input.settings.claudeAIFlashcards,
    noLimits: input.noLimits,
  });

  const tConvert = Date.now();
  const results = await Promise.all(input.files.map((file) => convertFile(file, input)));
  const convertedFiles = results.flatMap((r) => (r ? [r] : []));
  console.log('[PrepareDeck] file conversions done', {
    convertedCount: convertedFiles.length,
    durationMs: Date.now() - tConvert,
  });

  input.files.push(...convertedFiles);

  if (input.settings.claudeAIFlashcards && input.noLimits) {
    console.log('[PrepareDeck] Claude branch: collecting HTML content');
    const htmlFiles = input.files.filter(
      (f) => (isHTMLFile(f.name) || isMarkdownFile(f.name)) && f.contents
    );

    const mediaFiles = input.files
      .filter((f) => !isHTMLFile(f.name) && !isMarkdownFile(f.name))
      .map((f) => f.name);

    const userInstructions = input.settings.userInstructions;
    console.log('[PrepareDeck] Claude branch: calling generateDeckInfo', {
      htmlFileCount: htmlFiles.length,
      mediaFilesCount: mediaFiles.length,
      hasUserInstructions: !!userInstructions?.trim(),
    });
    const tClaude = Date.now();
    const deckInfoArrays = await Promise.all(
      htmlFiles.map((f) =>
        generateDeckInfo(f.contents!.toString(), mediaFilesForHtmlFile(f.name, mediaFiles), userInstructions)
      )
    );
    const deckInfo = deckInfoArrays.flatMap((decks, i) => {
      const prefix = deckPrefixFromFilePath(htmlFiles[i].name);
      return decks
        .filter((d) => d.cards.length > 0)
        .map((d) => ({
          ...d,
          name: prefix ? `${prefix}::${d.name}` : d.name,
        }));
    });
    console.log('[PrepareDeck] Claude branch: generateDeckInfo done', {
      durationMs: Date.now() - tClaude,
      htmlFilesProcessed: htmlFiles.length,
      totalDecks: deckInfo.length,
      totalCards: deckInfo.reduce((sum, d) => sum + d.cards.length, 0),
    });

    const tMedia = Date.now();
    for (const file of input.files) {
      if (!isHTMLFile(file.name) && !isMarkdownFile(file.name) && file.contents) {
        const dest = path.join(input.workspace.location, file.name);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, Buffer.isBuffer(file.contents) ? file.contents : Buffer.from(file.contents as string));
      }
    }
    console.log('[PrepareDeck] Claude branch: media written', { durationMs: Date.now() - tMedia });

    const deckName = deckInfo.length === 1 ? deckInfo[0].name : (input.name ?? deckInfo[0]?.name);
    const exporter = new CustomExporter(deckName, input.workspace.location);
    exporter.configure(deckInfo as unknown as Deck[]);
    const tExport = Date.now();
    const apkg = await exporter.save();
    console.log('[PrepareDeck] Claude branch: exporter.save done', { durationMs: Date.now() - tExport });
    console.log('[PrepareDeck] done (Claude path)', { totalMs: Date.now() - tTotal });
    return { name: getDeckFilename(deckName), apkg, deck: [] };
  }

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
