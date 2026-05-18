export class DeckTooLargeError extends Error {
  constructor() {
    super('Deck too large to serialize');
    this.name = 'DeckTooLargeError';
  }
}
