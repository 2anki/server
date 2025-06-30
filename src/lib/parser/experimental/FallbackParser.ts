import * as cheerio from 'cheerio';

import { File } from '../../zip/zip';
import {
  isHTMLFile,
  isMarkdownFile,
  isPlainText,
  isCSVFile,
} from '../../storage/checks';
import Deck from '../Deck';
import Note from '../Note';
import CardOption from '../Settings';
import { PlainTextParser } from './PlainTextParser/PlainTextParser';
import { Flashcard, isClozeFlashcard } from './PlainTextParser/types';
import get16DigitRandomId from '../../../shared/helpers/get16DigitRandomId';
import { getCardsFromCSV } from '@2anki/csv-to-apkg';

class FallbackParser {
  constructor(private readonly files: File[]) {}

  htmlToTextWithNewlines(html: string) {
    if (typeof html !== 'string' || !html.trim()) {
      console.warn(
        '[FallbackParser] htmlToTextWithNewlines called with invalid html:',
        html
      );
      return [];
    }
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

  /**
   * Extract bullet points from markdown content
   *
   * Matches lines starting with -, *, or + followed by one or more spaces or tabs,
   * and then any characters. This handles standard Markdown bullet point formats
   * as well as cloze deletion formats with backticks and equals separator.
   *
   * @param markdown markdown content
   * @returns array of bullet points or null if no bullet points found
   */
  getMarkdownBulletLists(markdown: string) {
    const bulletListRegex = /[-*+][ \t]+.*/g;
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

        if (!note.back || note.back.trim().length === 0) {
          const parts = note.name.split('\n');
          if (parts.length > 1) {
            note.name = parts[0];
            note.back = parts.slice(1).join('\n');
          }
        }
      }
      return note;
    });
  }

  run(settings: CardOption) {
    const decks = [];
    let clean = true;

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
        deckName = this.getTitleFromHTML(contents) ?? file.name;
      } else if (isMarkdownFile(file.name) || isPlainText(file.name)) {
        const plainTextParser = new PlainTextParser();
        const items = this.getMarkdownBulletLists(contents);
        if (!items) {
          continue;
        }
        const found = plainTextParser.parse(items.join('\n'));
        cards = this.mapCardsToNotes(found);
        deckName = this.getTitleMarkdown(contents);
      } else if (isCSVFile(file.name)) {
        const csv = new TextDecoder().decode(file.contents as Uint8Array);
        deckName = file.name ?? 'Default';
        cards = getCardsFromCSV(csv) as Note[];
        clean = false;
      }

      if (cards.length > 0) {
        decks.push(
          new Deck(
            deckName,
            clean ? Deck.CleanCards(cards) : cards, // Do not clean csv files
            '', // skip cover image
            '', // skip style
            get16DigitRandomId(),
            settings
          )
        );
      }
    }
    return decks;
  }
}

export default FallbackParser;
