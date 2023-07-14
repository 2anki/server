import cheerio from 'cheerio';

import { File } from '../../anki/zip';
import Deck from '../Deck';
import Note from '../Note';
import Settings from '../Settings';
import { PlainTextParser } from './PlainTextParser/PlainTextParser';
import { isBasicFlashcard, isClozeFlashcard } from './PlainTextParser/types';

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

  run(settings: Settings) {
    const decks = [];
    for (const file of this.files) {
      const contents = file.contents?.toString();
      if (!contents) {
        continue;
      }
      const plainText = this.htmlToTextWithNewlines(contents);
      const plainTextParser = new PlainTextParser();
      const found = plainTextParser.parse(plainText.join('\n'));

      const cards: Note[] = found.filter(Boolean).map((card, index) => {
        const note = new Note(card.front, '');
        note.number = index;
        if (isClozeFlashcard(card)) {
          note.cloze = true;
        } else {
          note.back = card.back;
        }
        return note;
      });

      decks.push(
        new Deck(
          this.getTitleFromHTML(contents),
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
