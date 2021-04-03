import Note from "./Note";

export default class Deck {
  name: string;
  cards: Note[];
  image: string | undefined;
  style: string | null;
  id: number;

  constructor(
    name: string,
    cards: Note[],
    image: string | undefined,
    style: string | null,
    id: number
  ) {
    this.name = name;
    this.cards = cards;
    this.image = image;
    this.style = style;
    this.id = id;
  }

  cleanStyle() {
    if (this.style) {
      return this.style.replace(/'/g, '"');
    } else {
      return "";
    }
  }
}
