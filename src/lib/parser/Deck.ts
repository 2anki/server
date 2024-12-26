import Note from './Note';
import CardOption from './Settings';

export default class Deck {
  name: string;

  cards: Note[];

  image: string | undefined;

  style: string | null;

  id: number;

  settings: CardOption | null;

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
