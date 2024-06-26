import Note from './Note';
import Settings from './Settings';

export default class Deck {
  name: string;

  cards: Note[];

  image: string | undefined;

  style: string | null;

  id: number;

  settings: Settings | null;

  get cardCount() {
    return this.cards.length;
  }

  constructor(
    name: string,
    cards: Note[],
    image: string | undefined,
    style: string | null,
    id: number,
    settings: Settings
  ) {
    this.settings = settings;
    this.name = name;
    this.cards = cards;
    this.image = image;
    this.style = style;
    this.id = id;
    console.log(`New Deck with ${this.cards.length} cards`);
  }

  static CleanCards(cards: Note[]) {
    return cards.filter(
      (note) =>
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
