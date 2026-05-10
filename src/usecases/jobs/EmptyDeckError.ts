export class EmptyDeckError extends Error {
  constructor() {
    super();
    this.name = 'EmptyDeckError';
  }
}
