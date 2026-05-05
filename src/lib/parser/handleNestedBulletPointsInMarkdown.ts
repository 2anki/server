import Deck from './Deck';
import { getTitleFromMarkdown } from './getTitleFromMarkdown';
import get16DigitRandomId from '../../shared/helpers/get16DigitRandomId';
import Note from './Note';
import { markdownToHTML } from '../markdown';
import * as cheerio from 'cheerio';

import CardOption from './Settings';
import { embedFile } from './exporters/embedFile';
import { isImageFileEmbedable } from '../storage/checks';
import CustomExporter from './exporters/CustomExporter';
import Workspace from './WorkSpace';

import { File } from '../zip/zip';

function dedent(text: string): string {
  const lines = text.split('\n');
  const nonEmptyLines = lines.filter((l) => l.trim().length > 0);
  if (nonEmptyLines.length === 0) return text;
  const minIndent = Math.min(...nonEmptyLines.map((l) => l.match(/^[ \t]*/)?.[0].length ?? 0));
  if (minIndent === 0) return text;
  return lines.map((l) => l.slice(minIndent)).join('\n');
}

const BULLET_POINT_REGEX = /^-/;

interface HandleNestedBulletPointsInMarkdownInput {
  name: string;
  contents: string | undefined;
  deckName: string | undefined;
  decks: Deck[];
  settings: CardOption;
  exporter: CustomExporter;
  workspace: Workspace;
  files: File[];
}

export const handleNestedBulletPointsInMarkdown = (
  input: HandleNestedBulletPointsInMarkdownInput
) => {
  const {
    name,
    contents,
    deckName,
    decks,
    settings,
    exporter,
    workspace,
    files,
  } = input;
  const deck = new Deck(
    deckName ?? getTitleFromMarkdown(contents) ?? name,
    [],
    '',
    '',
    get16DigitRandomId(),
    settings
  );

  decks.push(deck);

  // Parse the markdown content
  const lines = contents?.split('\n') ?? [];
  let isCreating = false;
  let currentFront = '';
  let currentBack = '';
  const trimWhitespace = true;

  for (const line of lines) {
    if (line.trim().length === 0) {
      continue;
    }

    if (BULLET_POINT_REGEX.exec(line) && isCreating) {
      const convertedBack = markdownToHTML(dedent(currentBack), trimWhitespace);
      const dom = cheerio.load(convertedBack, {
        xmlMode: true,
      });
      const images = dom('img');
      const media: string[] = [];

      images.each((_i, elem) => {
        const src = dom(elem).attr('src');
        if (src && isImageFileEmbedable(src)) {
          const decodedSrc = decodeURIComponent(src);
          const newName = embedFile({
            exporter: exporter,
            files: files,
            filePath: decodedSrc,
            workspace: workspace,
          });
          if (newName) {
            dom(elem).attr('src', newName);
            media.push(newName);
          }
        }
      });

      const note = new Note(
        currentFront,
        dom.html() || ''
      );
      note.media = media;
      deck.cards.push(note);
      isCreating = false;
      currentFront = '';
      currentBack = '';
    }

    if (BULLET_POINT_REGEX.exec(line) && !isCreating) {
      isCreating = true;
      currentFront = markdownToHTML(line, trimWhitespace);
      currentBack = '';
    } else if (isCreating) {
      currentBack += line + '\n';
    }
  }

  // Ensure the last card is processed
  if (currentBack !== '' || currentFront !== '') {
    const convertedBack = markdownToHTML(dedent(currentBack), trimWhitespace);
    const dom = cheerio.load(convertedBack, {
      xmlMode: true,
    });
    const images = dom('img');
    const media: string[] = [];

    images.each((_i, elem) => {
      const src = dom(elem).attr('src');
      if (src && isImageFileEmbedable(src)) {
        const decodedSrc = decodeURIComponent(src);
        const newName = embedFile({
          exporter,
          files: files,
          filePath: decodedSrc,
          workspace,
        });
        if (newName) {
          dom(elem).attr('src', newName);
          media.push(newName);
        }
      }
    });

    const note = new Note(
      currentFront,
      dom.html() || ''
    );
    note.media = media;
    deck.cards.push(note);
  }

  return decks;
};
