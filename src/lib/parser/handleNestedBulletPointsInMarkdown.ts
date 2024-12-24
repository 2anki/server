import Deck from './Deck';
import { getTitleFromMarkdown } from './getTitleFromMarkdown';
import get16DigitRandomId from '../../shared/helpers/get16DigitRandomId';
import Note from './Note';
import { markdownToHTML } from '../markdown';
import cheerio from 'cheerio';

import CardOption from './Settings';
import { embedFile } from './exporters/embedFile';
import { isImageFileEmbedable } from '../storage/checks';
import CustomExporter from './exporters/CustomExporter';
import Workspace from './WorkSpace';

import { File } from '../zip/zip';

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

  for (const line of lines) {
    if (line.trim().length === 0) {
      continue;
    }

    const isEnd = lines.length - 1 == lines.indexOf(line);
    if (isEnd || (BULLET_POINT_REGEX.exec(line) && isCreating)) {
      const dom = cheerio.load(currentBack, {
        xmlMode: true,
      });
      const images = dom('img');
      const media: string[] = [];

      images.each((_i, elem) => {
        const src = dom(elem).attr('src');
        if (src && isImageFileEmbedable(src)) {
          const newName = embedFile({
            exporter: exporter,
            files: files,
            filePath: src,
            workspace: workspace,
          });
          if (newName) {
            dom(elem).attr('src', newName);
            media.push(newName);
          }
        }
      });

      currentBack = dom.html();
      const note = new Note(currentFront, markdownToHTML(currentBack));
      note.media = media;
      deck.cards.push(note);
      isCreating = false;
      currentFront = '';
      currentBack = '';
    }

    if (BULLET_POINT_REGEX.exec(line) && !isCreating) {
      isCreating = true;
      currentFront = markdownToHTML(line);
      currentBack = '';
    } else if (isCreating) {
      currentBack += line + '\n';
    }
  }

  if (currentBack !== '' || currentFront !== '') {
    const dom = cheerio.load(currentBack, {
      xmlMode: true,
    });
    const images = dom('img');
    const media: string[] = [];

    images.each((_i, elem) => {
      const src = dom(elem).attr('src');
      if (src && isImageFileEmbedable(src)) {
        const newName = embedFile({
          exporter,
          files: files,
          filePath: src,
          workspace,
        });
        if (newName) {
          dom(elem).attr('src', newName);
          media.push(newName);
        }
      }
    });

    currentBack = dom.html() || '';
    const note = new Note(currentFront, markdownToHTML(currentBack));
    note.media = media;
    deck.cards.push(note);
  }

  return decks;
};
