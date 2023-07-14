import cheerio from 'cheerio';

import { File } from '../../anki/zip';
import { isHTMLFile, isMarkdownFile, isPlainText } from '../../storage/checks';
import Deck from '../Deck';
import Note from '../Note';
import Settings from '../Settings';
import { PlainTextParser } from './PlainTextParser/PlainTextParser';
import { Flashcard, isClozeFlashcard } from './PlainTextParser/types';

class FallbackParser {
  constructor(private readonly files: File[]) {}

  htmlToTextWithNewlines(html: string) {
    const $ = cheerio.load(html);

    function processListItems(items: cheerio.Cheerio) {
      let result = '';
      items.each((_, element) => {
        const itemText = $(element).text().trim();
        result += `• ${itemText}\n`;
      });
      return result;
    }

    const elem = $('ul, ol');
    let items: string[] = [];
    elem.each((_, element) => {
      const listItems = $(element).find('li');
      const listText = processListItems(listItems);
      items.push(listText);
    });

    return items;
  }

  getTitleFromHTML(html: string) {
    const $ = cheerio.load(html);
    return $('title').text().trim();
  }

  getStyleTagFromString(html: string) {
    const $ = cheerio.load(html);
    const styleTag = $('style');

    if (styleTag.length === 0) {
      return ''; // No style tag found, return an empty string
    }

    return styleTag.text() ?? '';
  }

  getMarkdownBulletLists(markdown: string) {
    const bulletListRegex = /(\*|\-|\+)( .*)+/g;
    return markdown.match(bulletListRegex);
  }

  /**
   * Return the correct title from markdown
   *
   * Notion can have two titles in Markdown files.
   * The first one is the title with a the id of the page.
   * The second one is the title of the page only.
   *
   * @param markdown user input markdown
   * @returns deck title
   */
  getTitleMarkdown(markdown: string) {
    const headingRegex = /^(#{1,6})\s+(.*)$/gm;
    const matches = [...markdown.matchAll(headingRegex)];
    if (matches.length >= 2) {
      return matches[1][2]; // return second match
    } else if (matches.length > 0) {
      return matches[0][2];
    }
    return 'Default';
  }

  mapCardsToNotes(cards: Flashcard[]): Note[] {
    return cards.filter(Boolean).map((card, index) => {
      const note = new Note(card.front, '');
      note.number = index;
      if (isClozeFlashcard(card)) {
        note.cloze = true;
      } else {
        note.back = card.back;
      }
      return note;
    });
  }

  run(settings: Settings) {
    const decks = [];
    for (const file of this.files) {
      const contents = file.contents?.toString();
      if (!contents) {
        continue;
      }

      let cards: Note[] = [];
      let deckName = 'Untitled';
      if (isHTMLFile(file.name)) {
        const plainText = this.htmlToTextWithNewlines(contents).join('\n');
        const plainTextParser = new PlainTextParser();
        const found = plainTextParser.parse(plainText);
        cards = this.mapCardsToNotes(found);
        deckName = this.getTitleFromHTML(contents);
      } else if (isMarkdownFile(file.name) || isPlainText(file.name)) {
        const plainTextParser = new PlainTextParser();
        const items = this.getMarkdownBulletLists(contents);
        if (!items) {
          continue;
        }
        const found = plainTextParser.parse(items.join('\n'));
        cards = this.mapCardsToNotes(found);
        deckName = this.getTitleMarkdown(contents);
      }

      decks.push(
        new Deck(
          deckName,
          cards,
          '', // skip cover image
          '', // skip style
          Deck.GenerateId(),
          settings
        )
      );
    }
    return decks;
  }
}

export default FallbackParser;
