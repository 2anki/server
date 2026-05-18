import Note from './Note';
import CardOption from './Settings';

export default class Deck {
  name: string;

  cards: Note[];

  image: string | undefined;

  style: string | null;

  id: number;

  settings: CardOption | null;

  globalTags: string[];

  mcqCount = 0;

  mcqSkippedCount = 0;

  get cardCount() {
    return this.cards.length;
  }

  constructor(
    name: string,
    cards: Note[],
    image: string | undefined,
    style: string | null,
    id: number,
    settings: CardOption
  ) {
    this.settings = settings;
    this.name = name.replace(/\n/g, ' ');
    this.cards = cards;
    this.image = image;
    this.style = style;
    this.id = id;
    this.globalTags = [];
    console.log(`New Deck with ${this.cards.length} cards`);
  }

  static CleanCards(cards: Note[]) {
    return cards.filter(
      (note) =>
        note.isValidMCQNote() ||
        note.isValidClozeNote() ||
        note.isValidInputNote() ||
        note.isValidBasicNote()
    );
  }

  cleanStyle() {
    if (this.style) {
      return this.style.replace(/'/g, '"');
    }
    return '';
  }
}
